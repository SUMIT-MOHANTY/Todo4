import React from 'react';
import TodoItem from './TodoItem';
import { ITodo } from '../services/todoApi';

interface TodoListProps {
  todos: ITodo[];
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDeleteTodo,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <div className="loading">Loading todos...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (todos.length === 0) {
    return <div className="empty-list">No todos yet. Add one above!</div>;
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDeleteTodo={onDeleteTodo}
        />
      ))}
    </div>
  );
};

export default TodoList;
