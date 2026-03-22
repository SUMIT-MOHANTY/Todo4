import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoInput, TodoUpdateInput } from '../types/todo';
import { secureFetch, sanitizeInput, validateTodoText } from '../utils/api';

// Define API endpoints - avoid hardcoding across components
const API_ENDPOINTS = {
  TODOS: '/api/todos',
  TODO: (id: string) => `/api/todos/${id}`,
};

// Custom hook for managing todos with security features
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos with security measures
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await secureFetch<Todo[]>(API_ENDPOINTS.TODOS);

      if (response.status === 'error') {
        setError(response.error || 'Failed to fetch todos');
      } else if (response.data) {
        setTodos(response.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add todo with input validation and sanitization
  const addTodo = useCallback(async (input: TodoInput): Promise<{ success: boolean; error?: string }> => {
    // Validate and sanitize input
    const validation = validateTodoText(input.text);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const sanitizedText = sanitizeInput(input.text);

    try {
      const response = await secureFetch<Todo>(API_ENDPOINTS.TODOS, {
        method: 'POST',
        body: JSON.stringify({ ...input, text: sanitizedText }),
      });

      if (response.status === 'error') {
        return { success: false, error: response.error };
      }

      if (response.data) {
        setTodos(prev => [...prev, response.data!]);
        return { success: true };
      }

      return { success: false, error: 'Failed to add todo' };
    } catch (err) {
      console.error('Failed to add todo:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Toggle todo completion status
  const toggleTodo = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);

      if (!todoToUpdate) {
        return { success: false, error: `Todo with id ${id} not found` };
      }

      return await updateTodo({
        id,
        completed: !todoToUpdate.completed
      });
    } catch (err) {
      console.error('Error toggling todo:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [todos]);

  // Update todo with validation
  const updateTodo = useCallback(async (input: TodoUpdateInput): Promise<{ success: boolean; error?: string }> => {
    // Validate text if provided
    if (input.text !== undefined) {
      const validation = validateTodoText(input.text);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      input.text = sanitizeInput(input.text);
    }

    try {
      const response = await secureFetch<Todo>(API_ENDPOINTS.TODO(input.id), {
        method: 'PATCH',
        body: JSON.stringify(input),
      });

      if (response.status === 'error') {
        return { success: false, error: response.error };
      }

      if (response.data) {
        setTodos(prev => prev.map(todo =>
          todo.id === input.id ? response.data! : todo
        ));
        return { success: true };
      }

      return { success: false, error: 'Failed to update todo' };
    } catch (err) {
      console.error('Failed to update todo:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Delete todo with proper confirmation and error handling
  const deleteTodo = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await secureFetch(API_ENDPOINTS.TODO(id), {
        method: 'DELETE',
      });

      if (response.status === 'error') {
        return { success: false, error: response.error };
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete todo:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  };
}
