from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define data file path
DATA_FILE = os.path.join(os.path.dirname(__file__), 'todos.json')

def load_todos():
    """Load todos from JSON file or return empty list if file doesn't exist."""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as file:
                return json.load(file)
        else:
            return []
    except Exception as e:
        logger.error(f"Error loading todos: {e}")
        return []

def save_todos(todos):
    """Save todos to JSON file."""
    try:
        with open(DATA_FILE, 'w') as file:
            json.dump(todos, file, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving todos: {e}")
        return False

def get_next_id(todos):
    """Generate next ID for a new todo."""
    if not todos:
        return 1
    return max(todo.get('id', 0) for todo in todos) + 1

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos or filter by completed status if specified."""
    try:
        todos = load_todos()
        completed_filter = request.args.get('completed')

        if completed_filter is not None:
            completed_bool = completed_filter.lower() == 'true'
            todos = [todo for todo in todos if todo.get('completed') == completed_bool]

        return jsonify(todos), 200
    except Exception as e:
        logger.error(f"Error in GET /api/todos: {e}")
        return jsonify({"error": "Failed to retrieve todos"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID."""
    try:
        todos = load_todos()
        todo = next((todo for todo in todos if todo.get('id') == todo_id), None)

        if todo is None:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        return jsonify(todo), 200
    except Exception as e:
        logger.error(f"Error in GET /api/todos/{todo_id}: {e}")
        return jsonify({"error": f"Failed to retrieve todo {todo_id}"}), 500

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo."""
    try:
        data = request.get_json()

        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400

        todos = load_todos()
        new_todo = {
            'id': get_next_id(todos),
            'title': data.get('title'),
            'completed': data.get('completed', False),
            'created_at': datetime.now().isoformat()
        }

        todos.append(new_todo)

        if save_todos(todos):
            return jsonify(new_todo), 201
        else:
            return jsonify({"error": "Failed to save todo"}), 500
    except Exception as e:
        logger.error(f"Error in POST /api/todos: {e}")
        return jsonify({"error": "Failed to create todo"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update an existing todo."""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No update data provided"}), 400

        todos = load_todos()
        todo_index = next((i for i, todo in enumerate(todos) if todo.get('id') == todo_id), None)

        if todo_index is None:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        # Update only provided fields
        for key, value in data.items():
            if key != 'id' and key != 'created_at':  # Protect these fields
                todos[todo_index][key] = value

        todos[todo_index]['updated_at'] = datetime.now().isoformat()

        if save_todos(todos):
            return jsonify(todos[todo_index]), 200
        else:
            return jsonify({"error": "Failed to save updated todo"}), 500
    except Exception as e:
        logger.error(f"Error in PUT /api/todos/{todo_id}: {e}")
        return jsonify({"error": f"Failed to update todo {todo_id}"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo by ID."""
    try:
        todos = load_todos()
        initial_count = len(todos)
        todos = [todo for todo in todos if todo.get('id') != todo_id]

        if len(todos) == initial_count:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        if save_todos(todos):
            return jsonify({"message": f"Todo {todo_id} deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to save after deletion"}), 500
    except Exception as e:
        logger.error(f"Error in DELETE /api/todos/{todo_id}: {e}")
        return jsonify({"error": f"Failed to delete todo {todo_id}"}), 500

@app.route('/', methods=['GET'])
def home():
    """Root endpoint to verify API is working."""
    return jsonify({"message": "Todo API is running", "status": "OK"}), 200

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

    # Create empty JSON file if it doesn't exist
    if not os.path.exists(DATA_FILE):
        save_todos([])

    app.run(host='0.0.0.0', port=5000, debug=True)
