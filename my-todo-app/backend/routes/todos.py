from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
from models import Todo, SessionLocal

todos_bp = Blueprint('todos', __name__)

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@todos_bp.route('', methods=['GET'])
def get_all_todos():
    try:
        with get_db() as db:
            todos = db.query(Todo).all()
            return jsonify([todo.to_dict() for todo in todos])
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('', methods=['POST'])
def create_todo():
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400

    try:
        with get_db() as db:
            todo = Todo(title=data['title'], completed=data.get('completed', False))
            db.add(todo)
            db.commit()
            db.refresh(todo)
            return jsonify(todo.to_dict()), 201
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    try:
        with get_db() as db:
            todo = db.query(Todo).filter(Todo.id == todo_id).first()
            if not todo:
                return jsonify({"error": "Todo not found"}), 404
            return jsonify(todo.to_dict())
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()

    try:
        with get_db() as db:
            todo = db.query(Todo).filter(Todo.id == todo_id).first()
            if not todo:
                return jsonify({"error": "Todo not found"}), 404

            if 'title' in data:
                todo.title = data['title']
            if 'completed' in data:
                todo.completed = data['completed']

            db.commit()
            db.refresh(todo)
            return jsonify(todo.to_dict())
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@todos_bp.route('/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        with get_db() as db:
            todo = db.query(Todo).filter(Todo.id == todo_id).first()
            if not todo:
                return jsonify({"error": "Todo not found"}), 404

            db.delete(todo)
            db.commit()
            return jsonify({"message": "Todo deleted successfully"})
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
