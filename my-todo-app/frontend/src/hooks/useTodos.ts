import { useState, useEffect } from 'react';
import { Todo, fetchTodos, createTodo, updateTodo, deleteTodo } from '../services/todoApi';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all todos
  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const data = await fetchTodos();
        setTodos(data);
        setError(null);
      } catch (err) {
        setError('Failed to load todos. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Add a new todo
  const addTodo = async (title: string) => {
    try {
      const newTodo = await createTodo(title);
      if (newTodo) {
        setTodos(prev => [...prev, newTodo]);
      }
      return true;
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error(err);
      return false;
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updated = await updateTodo(id, { completed: !todo.completed });
      if (updated) {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      }
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    }
  };

  // Delete a todo
  const removeTodo = async (id: number) => {
    try {
      const success = await deleteTodo(id);
      if (success) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error(err);
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    removeTodo
  };
};
