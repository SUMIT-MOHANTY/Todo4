import unittest
import json
import os
import sys
import tempfile
from app import app

class TodoAPITest(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        # Use a temporary file for testing
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        app.config['DATA_FILE'] = self.temp_db.name

        # Initialize with empty todos
        with open(self.temp_db.name, 'w') as f:
            json.dump([], f)

    def tearDown(self):
        os.unlink(self.temp_db.name)

    def test_create_todo(self):
        response = self.app.post('/api/todos',
                                 data=json.dumps({'title': 'Test todo'}),
                                 content_type='application/json')
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['title'], 'Test todo')
        self.assertEqual(data['completed'], False)

    def test_get_todos(self):
        # First create a todo
        self.app.post('/api/todos',
                      data=json.dumps({'title': 'Test todo'}),
                      content_type='application/json')

        # Then get all todos
        response = self.app.get('/api/todos')
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Test todo')

    def test_update_todo(self):
        # First create a todo
        response = self.app.post('/api/todos',
                                data=json.dumps({'title': 'Test todo'}),
                                content_type='application/json')
        todo_id = json.loads(response.get_data(as_text=True))['id']

        # Then update it
        response = self.app.put(f'/api/todos/{todo_id}',
                               data=json.dumps({'title': 'Updated todo', 'completed': True}),
                               content_type='application/json')
        data = json.loads(response.get_data(as_text=True))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['title'], 'Updated todo')
        self.assertTrue(data['completed'])

    def test_delete_todo(self):
        # First create a todo
        response = self.app.post('/api/todos',
                                data=json.dumps({'title': 'Test todo'}),
                                content_type='application/json')
        todo_id = json.loads(response.get_data(as_text=True))['id']

        # Then delete it
        response = self.app.delete(f'/api/todos/{todo_id}')
        self.assertEqual(response.status_code, 200)

        # Verify it's gone
        response = self.app.get(f'/api/todos/{todo_id}')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
