import React, { useEffect, useState } from 'react';
import { todoApi, Todo } from '../services/todoApi';

const TodoApiExample: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  // Fetch all todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const fetchedTodos = await todoApi.getAllTodos();
        setTodos(fetchedTodos);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Add a new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      setLoading(true);
      const newTodo = await todoApi.createTodo({
        title: newTodoTitle,
        completed: false,
      });
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion status
  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await todoApi.toggleTodoComplete(id, !completed);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err: any) {
      setError(err.message || `Failed to update todo ${id}`);
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err: any) {
      setError(err.message || `Failed to delete todo ${id}`);
    }
  };

  return (
    <div className="todo-app">
      <h1>Todo List</h1>

      {/* Error display */}
      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Add todo form */}
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new todo"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newTodoTitle.trim()}>
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
      </form>

      {/* Todo list */}
      {loading && <div className="loading">Loading todos...</div>}

      <ul className="todo-list">
        {todos.length === 0 && !loading ? (
          <li className="empty-state">No todos yet. Add one above!</li>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id!, todo.completed)}
              />
              <span>{todo.title}</span>
              <button onClick={() => handleDeleteTodo(todo.id!)}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TodoApiExample;
