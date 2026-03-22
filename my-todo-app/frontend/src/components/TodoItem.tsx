import React from 'react';
import { ITodo } from '../services/todoApi';

interface TodoItemProps {
  todo: ITodo;
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDeleteTodo }) => {
  const handleToggleClick = () => {
    onToggleComplete(todo.id);
  };

  const handleDeleteClick = () => {
    onDeleteTodo(todo.id);
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleClick}
        />
        <span className="todo-text">{todo.title}</span>
      </div>
      <button className="delete-btn" onClick={handleDeleteClick}>
        Delete
      </button>
    </div>
  );
};

export default TodoItem;
