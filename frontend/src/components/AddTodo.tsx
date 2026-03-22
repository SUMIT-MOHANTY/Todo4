import React, { useState } from 'react';
import { TodoInput } from '../types/todo';
import { validateTodoText } from '../utils/api';

interface AddTodoProps {
  onAdd: (todo: TodoInput) => Promise<{ success: boolean; error?: string }>;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
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
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex items-center">
        <input
          id="new-todo"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo..."
          disabled={isLoading}
          maxLength={500}
          aria-describedby={error ? "add-todo-error" : undefined}
          className={`flex-1 p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label="New todo title"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          aria-busy={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isLoading ? 'Adding...' : 'Add Todo'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1" id="add-todo-error" role="alert">{error}</p>}
    </form>
  );
};

export default AddTodo;
