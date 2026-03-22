from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory database for todos
todos = {}

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo item"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data or 'title' not in data:
            return jsonify({"error": "Title is required"}), 400

        # Create new todo with default values
        todo_id = str(uuid.uuid4())
        new_todo = {
            "id": todo_id,
            "title": data['title'],
            "description": data.get('description', ''),
            "completed": data.get('completed', False),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Store in our "database"
        todos[todo_id] = new_todo

        return jsonify(new_todo), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create todo: {str(e)}"}), 500

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todo items"""
    try:
        # Optional filtering by completion status
        completed_filter = request.args.get('completed')
        if completed_filter is not None:
            completed_bool = completed_filter.lower() == 'true'
            filtered_todos = [todo for todo in todos.values() if todo['completed'] == completed_bool]
            return jsonify(filtered_todos), 200

        # Return all todos
        return jsonify(list(todos.values())), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve todos: {str(e)}"}), 500

@app.route('/api/todos/<todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID"""
    try:
        if todo_id not in todos:
            return jsonify({"error": "Todo not found"}), 404

        return jsonify(todos[todo_id]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve todo: {str(e)}"}), 500

@app.route('/api/todos/<todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a specific todo"""
    try:
        if todo_id not in todos:
            return jsonify({"error": "Todo not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No update data provided"}), 400

        # Update only the fields that are provided
        todo = todos[todo_id]
        if 'title' in data:
            todo['title'] = data['title']
        if 'description' in data:
            todo['description'] = data['description']
        if 'completed' in data:
            todo['completed'] = data['completed']

        # Update the updated_at timestamp
        todo['updated_at'] = datetime.now().isoformat()

        return jsonify(todo), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update todo: {str(e)}"}), 500

@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a specific todo"""
    try:
        if todo_id not in todos:
            return jsonify({"error": "Todo not found"}), 404

        deleted_todo = todos.pop(todo_id)
        return jsonify({"message": "Todo deleted successfully", "deleted": deleted_todo}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete todo: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
