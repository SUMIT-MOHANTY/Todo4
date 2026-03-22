import axios, { AxiosError, AxiosResponse } from 'axios';

// Define API base URL with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Define Todo interface
export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log the error for debugging
    console.error('API Error:', error);

    // Handle different error scenarios
    if (error.response) {
      // Server responded with non-2xx status
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        localStorage.removeItem('token');
        // You could add redirection logic here
      }
      return Promise.reject({
        status: error.response.status,
        message: error.response.data || 'Server error occurred',
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else caused the error
      return Promise.reject({
        status: 0,
        message: 'Request error: ' + error.message,
      });
    }
  }
);

// API service methods with robust error handling
export const todoApi = {
  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    try {
      const response: AxiosResponse<Todo[]> = await apiClient.get('/todos');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      throw error;
    }
  },

  // Get todo by ID
  async getTodoById(id: number): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await apiClient.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch todo with id ${id}:`, error);
      throw error;
    }
  },

  // Create a new todo
  async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await apiClient.post('/todos', todo);
      return response.data;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  },

  // Update a todo
  async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await apiClient.put(`/todos/${id}`, todo);
      return response.data;
    } catch (error) {
      console.error(`Failed to update todo with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a todo
  async deleteTodo(id: number): Promise<void> {
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (error) {
      console.error(`Failed to delete todo with id ${id}:`, error);
      throw error;
    }
  },

  // Toggle todo completion status
  async toggleTodoComplete(id: number, completed: boolean): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await apiClient.patch(`/todos/${id}`, { completed });
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle completion for todo with id ${id}:`, error);
      throw error;
    }
  },
};

// Export the API client for direct use if needed
export default apiClient;
