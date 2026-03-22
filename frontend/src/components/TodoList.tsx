import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import { useTodos } from '../hooks/useTodos';
import { TodoUpdateInput } from '../types/todo';

export const TodoList: React.FC = () => {
  const {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo
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

  return (
    <div className="todo-list-container">
      <h1>My Todo List</h1>

      {/* Add new todo form */}
      <AddTodo onAdd={addTodo} />

      {/* Global error message */}
      {(error || actionError) && (
        <div className="error-container" role="alert">
          <p>{error || actionError}</p>
          {error && (
            <button onClick={handleRetry} className="retry-button">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state" aria-live="polite">
          <p>Loading todos...</p>
        </div>
      )}

      {/* Todo list */}
      {!loading && !error && (
        <div className="todos-list">
          {todos.length === 0 ? (
            <div className="empty-state">
              <p>No todos yet. Add one above!</p>
            </div>
          ) : (
            <>
              <h2>Your Todos ({todos.length})</h2>
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;
