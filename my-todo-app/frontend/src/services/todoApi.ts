import axios from 'axios';

export interface ITodo {
  id: number;
  title: string;
  completed: boolean;
}

// API base URL
const API_URL = '/api/todos';

// Create axios instance with error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export const todoApi = {
  // Get all todos
  getAll: async (): Promise<ITodo[]> => {
    try {
      const response = await api.get('');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch todos');
    }
  },

  // Add a new todo
  create: async (title: string): Promise<ITodo> => {
    try {
      const response = await api.post('', { title, completed: false });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create todo');
    }
  },

  // Toggle todo completed status
  toggle: async (id: number): Promise<ITodo> => {
    try {
      const response = await api.put(`/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to toggle todo ${id}`);
    }
  },

  // Delete a todo
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete todo ${id}`);
    }
  }
};
