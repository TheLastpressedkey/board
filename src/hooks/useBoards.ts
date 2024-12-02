import { useState, useCallback } from 'react';
import { Board, Card, ContentType } from '../types';
import { createCard } from '../utils/cardUtils';
import { fetchLinkMetadata } from '../utils/linkUtils';
import { database } from '../services/database';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const loadBoards = useCallback(async () => {
    try {
      const boardsData = await database.getBoards();
      if (boardsData && boardsData.length > 0) {
        setBoards(boardsData);
        setCurrentBoard(boardsData[0].id);
      } else {
        const newBoard = await database.createBoard('Main Board', true);
        setBoards([newBoard]);
        setCurrentBoard(newBoard.id);
      }
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  }, []);

  const createBoard = useCallback(async () => {
    try {
      const boardName = `Board ${boards.length + 1}`;
      const newBoard = await database.createBoard(boardName, false);
      setBoards(prev => [...prev, newBoard]);
      setCurrentBoard(newBoard.id);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  }, [boards.length]);

  const deleteBoard = useCallback(async (boardId: string) => {
    try {
      await database.deleteBoard(boardId);
      setBoards(prev => prev.filter(board => board.id !== boardId));
      if (currentBoard === boardId) {
        setCurrentBoard(boards[0]?.id || null);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  }, [boards, currentBoard]);

  const addCard = useCallback((
    position: { x: number; y: number }, 
    type: ContentType,
    dimensions?: { width: number; height: number }
  ) => {
    if (!currentBoard) return;

    const newCard = createCard(type, position, '', dimensions);
    
    setBoards(prevBoards => prevBoards.map(board => 
      board.id === currentBoard
        ? { ...board, cards: [...(board.cards || []), newCard] }
        : board
    ));
    setUnsavedChanges(true);
  }, [currentBoard]);

  const addLinkCard = useCallback(async (position: { x: number; y: number }, url: string) => {
    if (!currentBoard) return;

    try {
      const metadata = await fetchLinkMetadata(url);
      const newCard = createCard('link', position, url);
      newCard.metadata = metadata;

      setBoards(prevBoards => prevBoards.map(board => 
        board.id === currentBoard
          ? { ...board, cards: [...(board.cards || []), newCard] }
          : board
      ));
      
      // Auto-save after adding a link card
      const updatedBoard = boards.find(b => b.id === currentBoard);
      if (updatedBoard) {
        const updatedCards = [...(updatedBoard.cards || []), newCard];
        await database.saveCards(currentBoard, updatedCards);
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error adding link card:', error);
    }
  }, [currentBoard, boards]);

  const updateCardContent = useCallback((cardId: string, content: string) => {
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards?.map(card => 
        card.id === cardId ? { ...card, content } : card
      ) || []
    })));
    setUnsavedChanges(true);
  }, []);

  const updateCardPosition = useCallback((cardId: string, position: { x: number; y: number }) => {
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards?.map(card => 
        card.id === cardId ? { ...card, position } : card
      ) || []
    })));
    setUnsavedChanges(true);
  }, []);

  const updateCardDimensions = useCallback((cardId: string, dimensions: { width: number; height: number }) => {
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards?.map(card => 
        card.id === cardId ? { ...card, dimensions } : card
      ) || []
    })));
    setUnsavedChanges(true);
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards?.filter(card => card.id !== cardId) || []
    })));
    setUnsavedChanges(true);
  }, []);

  const saveBoards = useCallback(async () => {
    if (!currentBoard) return;

    try {
      const currentBoardData = boards.find(b => b.id === currentBoard);
      if (!currentBoardData?.cards) return;

      await database.saveCards(currentBoard, currentBoardData.cards);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving boards:', error);
      throw error;
    }
  }, [boards, currentBoard]);

  return {
    boards,
    currentBoard,
    setCurrentBoard,
    createBoard,
    deleteBoard,
    addCard,
    addLinkCard,
    deleteCard,
    updateCardPosition,
    updateCardContent,
    updateCardDimensions,
    loadBoards,
    saveBoards,
    hasUnsavedChanges: unsavedChanges,
    currentBoardData: currentBoard ? boards.find(b => b.id === currentBoard) : null
  };
}
