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

# Data file path
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
        logger.error(f"Error loading todos: {str(e)}")
        return []

def save_todos(todos):
    """Save todos to JSON file."""
    try:
        with open(DATA_FILE, 'w') as file:
            json.dump(todos, file, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving todos: {str(e)}")
        return False

def generate_id(todos):
    """Generate a unique ID for a new todo item."""
    if not todos:
        return 1
    return max(todo.get('id', 0) for todo in todos) + 1

# Routes for CRUD operations

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos or filter by completed status."""
    try:
        todos = load_todos()

        # Filter by completed status if query parameter is provided
        completed_filter = request.args.get('completed')
        if completed_filter is not None:
            completed_value = completed_filter.lower() == 'true'
            todos = [todo for todo in todos if todo.get('completed') == completed_value]

        return jsonify(todos), 200
    except Exception as e:
        logger.error(f"Error retrieving todos: {str(e)}")
        return jsonify({"error": "Failed to retrieve todos"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo by ID."""
    try:
        todos = load_todos()
        todo = next((t for t in todos if t.get('id') == todo_id), None)

        if todo:
            return jsonify(todo), 200
        else:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404
    except Exception as e:
        logger.error(f"Error retrieving todo {todo_id}: {str(e)}")
        return jsonify({"error": f"Failed to retrieve todo {todo_id}"}), 500

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo item."""
    try:
        data = request.get_json()

        if not data or 'title' not in data:
            return jsonify({"error": "Title is required"}), 400

        todos = load_todos()
        new_todo = {
            'id': generate_id(todos),
            'title': data['title'],
            'completed': data.get('completed', False),
            'createdAt': datetime.now().isoformat()
        }

        todos.append(new_todo)

        if save_todos(todos):
            return jsonify(new_todo), 201
        else:
            return jsonify({"error": "Failed to save todo"}), 500
    except Exception as e:
        logger.error(f"Error creating todo: {str(e)}")
        return jsonify({"error": "Failed to create todo"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update an existing todo item."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        todos = load_todos()
        todo_index = next((i for i, t in enumerate(todos) if t.get('id') == todo_id), None)

        if todo_index is None:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        # Update the todo while preserving fields that aren't being changed
        current_todo = todos[todo_index]
        updated_todo = {**current_todo, **data}
        updated_todo['id'] = todo_id  # Ensure ID remains the same
        todos[todo_index] = updated_todo

        if save_todos(todos):
            return jsonify(updated_todo), 200
        else:
            return jsonify({"error": "Failed to update todo"}), 500
    except Exception as e:
        logger.error(f"Error updating todo {todo_id}: {str(e)}")
        return jsonify({"error": f"Failed to update todo {todo_id}"}), 500

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo item by ID."""
    try:
        todos = load_todos()
        todo_index = next((i for i, t in enumerate(todos) if t.get('id') == todo_id), None)

        if todo_index is None:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        deleted_todo = todos.pop(todo_index)

        if save_todos(todos):
            return jsonify({"message": f"Todo {todo_id} deleted successfully", "deleted": deleted_todo}), 200
        else:
            return jsonify({"error": "Failed to save changes after deletion"}), 500
    except Exception as e:
        logger.error(f"Error deleting todo {todo_id}: {str(e)}")
        return jsonify({"error": f"Failed to delete todo {todo_id}"}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running."""
    return jsonify({"status": "ok", "message": "Todo API is running"}), 200

if __name__ == '__main__':
    # Create initial todos.json if it doesn't exist
    if not os.path.exists(DATA_FILE):
        initial_todos = []
        save_todos(initial_todos)
        logger.info(f"Created empty todos database at {DATA_FILE}")

    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
