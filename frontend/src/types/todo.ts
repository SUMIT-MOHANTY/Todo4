export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId?: string; // Optional for flexibility
}

export interface TodoInput {
  text: string;
}

export interface TodoUpdateInput {
  id: string;
  text?: string;
  completed?: boolean;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

export interface TodosApiResponse extends ApiResponse<Todo[]> {}
export interface TodoApiResponse extends ApiResponse<Todo> {}
