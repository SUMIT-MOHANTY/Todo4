import axios from 'axios';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const API_URL = '/api/todos';

export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const createTodo = async (title: string): Promise<Todo | null> => {
  try {
    const response = await axios.post(API_URL, { title, completed: false });
    return response.data;
  } catch (error) {
    console.error('Error creating todo:', error);
    return null;
  }
};

export const updateTodo = async (id: number, updates: Partial<Todo>): Promise<Todo | null> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    return null;
  }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);
    return false;
  }
};
