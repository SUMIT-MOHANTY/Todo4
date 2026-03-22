import React from 'react';
import TodoList from './components/TodoList';
import AddTodo from './components/AddTodo';
import { useTodos } from './hooks/useTodos';
import './styles.css';

function App() {
  const {
    todos,
    isLoading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo
  } = useTodos();

  return (
    <div className="app">
      <header>
        <h1>Todo App</h1>
      </header>

      <main>
        <AddTodo onAddTodo={addTodo} />

        <TodoList
          todos={todos}
          onToggleComplete={toggleTodo}
          onDeleteTodo={deleteTodo}
          isLoading={isLoading}
          error={error}
        />
      </main>

      <footer>
        <p>React TypeScript Todo App</p>
      </footer>
    </div>
  );
}

export default App;
