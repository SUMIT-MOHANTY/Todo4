from flask import Blueprint, request, jsonify
from models import db, Todo

todos_bp = Blueprint('todos', __name__)

@todos_bp.route('', methods=['GET'])
def get_todos():
    """Get all todo items"""
    try:
        todos = Todo.query.order_by(Todo.created_at.desc()).all()
        return jsonify([todo.to_dict() for todo in todos])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a specific todo item by ID"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404
        return jsonify(todo.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('', methods=['POST'])
def create_todo():
    """Create a new todo item"""
    try:
        data = request.get_json()

        # Validate input
        if not data or 'title' not in data:
            return jsonify({"error": "Title is required"}), 400

        if not data['title'].strip():
            return jsonify({"error": "Title cannot be empty"}), 400

        # Create new todo
        new_todo = Todo(
            title=data['title'],
            completed=data.get('completed', False)
        )

        db.session.add(new_todo)
        db.session.commit()

        return jsonify(new_todo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo item"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        data = request.get_json()

        # Update fields if they exist in the request
        if 'title' in data and data['title'].strip():
            todo.title = data['title']

        if 'completed' in data:
            todo.completed = bool(data['completed'])

        db.session.commit()
        return jsonify(todo.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>/toggle', methods=['PUT'])
def toggle_todo(todo_id):
    """Toggle the completed status of a todo item"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        todo.completed = not todo.completed
        db.session.commit()
        return jsonify(todo.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo item"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return jsonify({"error": f"Todo with ID {todo_id} not found"}), 404

        db.session.delete(todo)
        db.session.commit()
        return jsonify({"message": f"Todo {todo_id} deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
