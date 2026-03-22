import React, { useState } from 'react';

interface AddTodoProps {
  onAddTodo: (title: string) => Promise<void>;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setError('Todo title cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddTodo(title);
      setTitle(''); // Reset form after successful submission
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Todo'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default AddTodo;
