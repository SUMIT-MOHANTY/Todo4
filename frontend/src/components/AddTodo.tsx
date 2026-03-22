import React, { useState } from 'react';
import { TodoInput } from '../types/todo';
import { validateTodoText } from '../utils/api';

interface AddTodoProps {
  onAdd: (todo: TodoInput) => Promise<{ success: boolean; error?: string }>;
}

export const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate input
    const validation = validateTodoText(text);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const result = await onAdd({ text });

      if (result.success) {
        // Reset form on success
        setText('');
      } else {
        setError(result.error || 'Failed to add todo');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <div className="form-group">
        <label htmlFor="new-todo">New Todo</label>
        <input
          id="new-todo"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isLoading}
          maxLength={500}
          aria-describedby={error ? "add-todo-error" : undefined}
          className={error ? "input-error" : ""}
          autoComplete="off"
        />

        {error && (
          <div
            id="add-todo-error"
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        aria-busy={isLoading}
        className="add-button"
      >
        {isLoading ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
};

export default AddTodo;
