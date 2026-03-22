import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

/**
 * Interface representing a Todo item
 * @interface
 */
export interface Todo {
  /** Unique identifier for the todo item */
  id: string | number;
  /** Title/description of the todo task */
  title: string;
  /** Whether the todo has been completed */
  completed: boolean;
  /** Optional creation date of the todo */
  createdAt?: string;
  /** Optional last updated date of the todo */
  updatedAt?: string;
}

/**
 * Interface for creating a new Todo (without ID)
 * @interface
 */
export interface CreateTodoPayload {
  title: string;
  completed?: boolean;
}

/**
 * Interface for updating a Todo
 * @interface
 */
export interface UpdateTodoPayload {
  title?: string;
  completed?: boolean;
}

/**
 * Custom error class for API errors
 * @class
 */
export class TodoApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'TodoApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * TodoAPI service class for handling API communications
 * @class
 */
class TodoAPI {
  private api: AxiosInstance;
  private baseURL: string;

  /**
   * Create a new TodoAPI instance
   * @constructor
   */
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Setup request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleApiError(error)
    );
  }

  /**
   * Handle API errors in a consistent way
   * @param error - The error from Axios
   * @returns - A rejected promise with a formatted error
   * @private
   */
  private handleApiError(error: AxiosError): Promise<never> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;

      let message = 'An error occurred with the API request';

      if (status === 404) {
        message = 'Resource not found';
      } else if (status === 400) {
        message = 'Invalid request';
      } else if (status === 401) {
        message = 'Unauthorized - Please login';
      } else if (status === 403) {
        message = 'Forbidden - You do not have permission';
      } else if (status >= 500) {
        message = 'Server error - Please try again later';
      }

      return Promise.reject(new TodoApiError(message, status, data));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new TodoApiError('Network error - No response received', undefined, error.request));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new TodoApiError('Request configuration error', undefined, error.message));
    }
  }

  /**
   * Fetch all todos from the API
   * @returns Promise resolving to an array of Todo items
   */
  public async getTodos(): Promise<Todo[]> {
    try {
      const response: AxiosResponse<Todo[]> = await this.api.get('/todos');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  /**
   * Fetch a single todo by its ID
   * @param id - The ID of the todo to fetch
   * @returns Promise resolving to a single Todo item
   */
  public async getTodoById(id: string | number): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await this.api.get(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new todo item
   * @param todo - The todo data to create
   * @returns Promise resolving to the created Todo
   */
  public async createTodo(todo: CreateTodoPayload): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await this.api.post('/todos', todo);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  /**
   * Update an existing todo item
   * @param id - The ID of the todo to update
   * @param todo - The todo data to update
   * @returns Promise resolving to the updated Todo
   */
  public async updateTodo(id: string | number, todo: UpdateTodoPayload): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await this.api.put(`/todos/${id}`, todo);
      return response.data;
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a todo item
   * @param id - The ID of the todo to delete
   * @returns Promise resolving to true if deletion was successful
   */
  public async deleteTodo(id: string | number): Promise<boolean> {
    try {
      await this.api.delete(`/todos/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle the completed status of a todo
   * @param id - The ID of the todo to toggle
   * @returns Promise resolving to the updated Todo
   */
  public async toggleTodoStatus(id: string | number, completed: boolean): Promise<Todo> {
    try {
      const response: AxiosResponse<Todo> = await this.api.patch(`/todos/${id}/toggle`, { completed });
      return response.data;
    } catch (error) {
      console.error(`Error toggling todo ${id} status:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
const todoApi = new TodoAPI();
export default todoApi;
