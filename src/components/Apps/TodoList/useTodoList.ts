import { useState, useCallback, useEffect } from 'react';
import { Todo } from './types';
import { appStoreDataService } from '../../../services/appStoreData';

export function useTodoList(initialTodos?: Todo[], onDataChange?: (data: any) => void, cardId?: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load todos from database on mount
  useEffect(() => {
    const loadTodos = async () => {
      if (!cardId) {
        // Fallback to initialTodos if no cardId
        if (initialTodos) {
          setTodos(initialTodos.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          })));
        }
        setIsLoaded(true);
        return;
      }

      try {
        const data = await appStoreDataService.getAppData(cardId);
        if (data && data.todos) {
          setTodos(data.todos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          })));
        } else if (initialTodos) {
          // Use initialTodos as fallback
          setTodos(initialTodos.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          })));
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        // Fallback to initialTodos on error
        if (initialTodos) {
          setTodos(initialTodos.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          })));
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadTodos();
  }, [cardId]); // Only depend on cardId

  // Save todos to database whenever they change
  const saveTodos = useCallback(async (newTodos: Todo[]) => {
    if (!cardId || !isLoaded) return;

    try {
      const data = {
        todos: newTodos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt.toISOString()
        }))
      };

      await appStoreDataService.saveAppData(cardId, 'todolist', data);

      // Also call onDataChange for backward compatibility
      if (onDataChange) {
        onDataChange(data);
      }
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [cardId, isLoaded, onDataChange]);

  const addTodo = useCallback(async (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date()
    };
    
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  const toggleTodo = useCallback(async (id: string) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  const deleteTodo = useCallback(async (id: string) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    await saveTodos(newTodos);
  }, [todos, saveTodos]);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isLoaded
  };
}