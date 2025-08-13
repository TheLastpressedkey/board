import { useState, useCallback, useEffect } from 'react';
import { Todo } from './types';

export function useTodoList(initialTodos?: Todo[], onDataChange?: (data: any) => void) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (initialTodos) {
      return initialTodos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
    }
    return [];
  });

  // Notify parent component about changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        todos: todos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt.toISOString()
        }))
      });
    }
  }, [todos, onDataChange]);

  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date()
    };
    
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  };
}