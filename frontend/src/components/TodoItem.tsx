import React, { useState, useCallback } from 'react';
import { Todo } from '../types/todo';
import { sanitizeInput, validateTodoText } from '../utils/api';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle checkbox change with loading state
  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } catch (err) {
      console.error('Failed to toggle todo completion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit submission with validation and sanitization
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    const validation = validateTodoText(editText);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(todo.id, { text: sanitizeInput(editText) });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update todo text:', err);
      setError('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  // Safe delete with confirmation
  const handleDelete = async () => {
    // Prevent accidental deletion with confirmation
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } catch (err) {
      console.error('Failed to delete todo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit safely
  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="todo-item" data-testid={`todo-item-${todo.id}`}>
      {isEditing ? (
        <form onSubmit={handleSubmitEdit} className="edit-form">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            disabled={isLoading}
            autoFocus
            aria-label="Edit todo text"
            className="edit-input"
          />
          {error && <div className="error-message" role="alert">{error}</div>}
          <div className="edit-actions">
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="todo-content">
          <div className="todo-checkbox">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              disabled={isLoading}
              id={`todo-${todo.id}`}
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <label
              htmlFor={`todo-${todo.id}`}
              className={todo.completed ? 'completed' : ''}
            >
              {/* Use dangerouslySetInnerHTML only because we already sanitized the content */}
              <span dangerouslySetInnerHTML={{ __html: todo.text }} />
            </label>
          </div>

          <div className="todo-actions">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              aria-label={`Edit todo: ${todo.text}`}
              className="edit-button"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              aria-label={`Delete todo: ${todo.text}`}
              className="delete-button"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Show creation date for audit trail */}
      <div className="todo-meta">
        <small>Created: {new Date(todo.createdAt).toLocaleString()}</small>
        {todo.updatedAt !== todo.createdAt && (
          <small> | Updated: {new Date(todo.updatedAt).toLocaleString()}</small>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
