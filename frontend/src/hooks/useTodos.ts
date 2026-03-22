import { useState, useEffect } from 'react';
import { Todo } from '../types';

// This would normally come from an environment variable or configuration
const API_URL = '/api/todos';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos on initial load
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Failed to fetch todos: ${response.status}`);
        }

        const data = await response.json();
        setTodos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Add a new todo
  const addTodo = async (title: string) => {
    try {
      setError(null);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, completed: false }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo: ${response.status}`);
      }

      const newTodo = await response.json();
      setTodos(prevTodos => [...prevTodos, newTodo]);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  };

  // Toggle todo completion status
  const toggleTodo = async (id: number) => {
    try {
      setError(null);
      const todoToUpdate = todos.find(todo => todo.id === id);

      if (!todoToUpdate) {
        throw new Error(`Todo with id ${id} not found`);
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todoToUpdate.completed }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.status}`);
      }

      const updatedTodo = await response.json();

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  // Delete a todo
  const deleteTodo = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.status}`);
      }

      // Remove the todo from state
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    loading,
    error,
  };
};
