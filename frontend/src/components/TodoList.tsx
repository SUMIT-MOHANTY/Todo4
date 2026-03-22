import React from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';

const TodoList: React.FC = () => {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    loading,
    error
  } = useTodos();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>

      <AddTodo onAdd={addTodo} />

      <div className="bg-gray-50 rounded border border-gray-200">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {todos.length > 0 && (
          <p>{todos.filter(todo => todo.completed).length} of {todos.length} tasks completed</p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
