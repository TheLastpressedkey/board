import { useState, useCallback, useEffect } from 'react';
import { Todo } from './types';

export function useTodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load initial todos from metadata if available
  useEffect(() => {
    const savedTodos = window.cardMetadata?.todos;
    if (savedTodos) {
      setTodos(savedTodos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })));
    }
  }, []);

  // Notify parent component about changes
  useEffect(() => {
    if (hasChanges && window.onCardDataChange) {
      window.onCardDataChange({
        todos: todos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt.toISOString()
        }))
      });
      setHasChanges(false);
    }
  }, [todos, hasChanges]);

  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date()
    };
    
    setTodos(prev => [...prev, newTodo]);
    setHasChanges(true);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    setHasChanges(true);
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setHasChanges(true);
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  };
}
