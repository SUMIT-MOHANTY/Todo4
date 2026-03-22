import React, { useState } from 'react';

interface AddTodoProps {
  onAdd: (title: string) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!title.trim()) {
      setError('Todo title cannot be empty');
      return;
    }

    onAdd(title);
    setTitle('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error && e.target.value.trim()) setError(null);
          }}
          placeholder="Add a new todo..."
          className={`flex-1 p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label="New todo title"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </form>
  );
};

export default AddTodo;
