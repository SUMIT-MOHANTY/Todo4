import React, { useState, useCallback } from 'react';
import { Todo } from '../types/todo';
import { sanitizeInput, validateTodoText } from '../utils/api';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: { text?: string; completed?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
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
    <div className="flex items-center p-3 border-b border-gray-200 last:border-b-0" data-testid={`todo-item-${todo.id}`}>
      {isEditing ? (
        <form onSubmit={handleSubmitEdit} className="edit-form w-full">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            disabled={isLoading}
            autoFocus
            aria-label="Edit todo text"
            className="edit-input w-full p-2 border rounded"
          />
          {error && <div className="error-message text-red-500" role="alert">{error}</div>}
          <div className="edit-actions mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            disabled={isLoading}
            id={`todo-${todo.id}`}
            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
            aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          />
          <span
            className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
            dangerouslySetInnerHTML={{ __html: todo.text }}
          />
          <div className="todo-actions flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              aria-label={`Edit todo: ${todo.text}`}
              className="text-blue-500 hover:text-blue-700 focus:outline-none"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              aria-label={`Delete todo: ${todo.text}`}
              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
            >
              {isLoading ? 'Deleting...' : 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              }
            </button>
          </div>
        </>
      )}

      {/* Show creation date for audit trail */}
      <div className="todo-meta text-xs text-gray-500 mt-1">
        <small>Created: {new Date(todo.createdAt).toLocaleString()}</small>
        {todo.updatedAt !== todo.createdAt && (
          <small> | Updated: {new Date(todo.updatedAt).toLocaleString()}</small>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
