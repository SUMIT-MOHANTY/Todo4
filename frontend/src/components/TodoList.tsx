import React, { useState, useEffect } from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import { TodoUpdateInput } from '../types/todo';

const TodoList: React.FC = () => {
  const {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useTodos();

  const [actionError, setActionError] = useState<string | null>(null);

  // Clear action error after 5 seconds
  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => {
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  // Handle todo update with error handling
  const handleUpdateTodo = async (id: string, updates: { text?: string; completed?: boolean }) => {
    setActionError(null);
    try {
      const result = await updateTodo({ id, ...updates });
      if (!result.success) {
        setActionError(result.error || 'Failed to update todo');
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      setActionError('An unexpected error occurred');
    }
  };

  // Handle todo deletion with error handling
  const handleDeleteTodo = async (id: string) => {
    setActionError(null);
    try {
      const result = await deleteTodo(id);
      if (!result.success) {
        setActionError(result.error || 'Failed to delete todo');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setActionError('An unexpected error occurred');
    }
  };

  // Retry loading on API failure
  const handleRetry = () => {
    fetchTodos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>

      <AddTodo onAdd={addTodo} />

      {/* Global error message */}
      {(error || actionError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error || actionError}</span>
          {error && (
            <button onClick={handleRetry} className="retry-button ml-2 underline">
              Retry
            </button>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded border border-gray-200">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {todos.length > 0 && (
          <p>{todos.filter(todo => todo.completed).length} of {todos.length} tasks completed</p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
