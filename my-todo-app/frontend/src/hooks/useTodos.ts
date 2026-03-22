import { useState, useEffect, useCallback } from 'react';
import { todoApi, ITodo } from '../services/todoApi';

export const useTodos = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all todos
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Please refresh and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new todo
  const addTodo = useCallback(async (title: string) => {
    try {
      const newTodo = await todoApi.create(title);
      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      throw err; // Let the component handle the error
    }
  }, []);

  // Toggle todo completed status
  const toggleTodo = useCallback(async (id: number) => {
    try {
      const updatedTodo = await todoApi.toggle(id);
      setTodos(prev => prev.map(todo =>
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      console.error(err);
      setError('Failed to update todo. Please try again.');
    }
  }, []);

  // Delete a todo
  const deleteTodo = useCallback(async (id: number) => {
    try {
      await todoApi.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete todo. Please try again.');
    }
  }, []);

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    isLoading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refreshTodos: fetchTodos
  };
};
