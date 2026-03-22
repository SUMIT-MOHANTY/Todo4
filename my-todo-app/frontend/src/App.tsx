import React from 'react';
import TodoList from './components/TodoList';
import AddTodo from './components/AddTodo';
import { useTodos } from './hooks/useTodos';
import './styles.css';

const App: React.FC = () => {
  const { todos, loading, error, addTodo, toggleTodo, removeTodo } = useTodos();

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <h1>Todo App</h1>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={removeTodo} />
    </div>
  );
};

export default App;
