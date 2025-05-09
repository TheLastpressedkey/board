import { useState, useCallback, useEffect } from 'react';
import { Board, Card, ContentType } from '../types';
import { createCard } from '../utils/cardUtils';
import { fetchLinkMetadata } from '../utils/linkUtils';
import { database } from '../services/database';

const CURRENT_BOARD_KEY = 'weboard_current_board';
const CARD_MARGIN = 20; // Space between cards
const FIXED_CARD_WIDTH = 300; // Fixed width for all cards
const FIXED_CARD_HEIGHT = 200; // Fixed height for all cards
const ROWS = 3; // Number of rows for auto-arrange

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<string | null>(() => {
    return localStorage.getItem(CURRENT_BOARD_KEY) || null;
  });
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false);

  const loadBoards = useCallback(async () => {
    try {
      const boardsData = await database.getBoards();
      if (boardsData && boardsData.length > 0) {
        setBoards(boardsData);
        const savedBoard = localStorage.getItem(CURRENT_BOARD_KEY);
        const boardExists = boardsData.some(b => b.id === savedBoard);
        if (!savedBoard || !boardExists) {
          setCurrentBoard(boardsData[0].id);
          localStorage.setItem(CURRENT_BOARD_KEY, boardsData[0].id);
        }
      } else {
        const newBoard = await database.createBoard('Main Board', true);
        setBoards([newBoard]);
        setCurrentBoard(newBoard.id);
        localStorage.setItem(CURRENT_BOARD_KEY, newBoard.id);
      }
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  }, []);

  useEffect(() => {
    if (currentBoard) {
      localStorage.setItem(CURRENT_BOARD_KEY, currentBoard);
    }
  }, [currentBoard]);

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
        const firstBoard = boards[0]?.id;
        setCurrentBoard(firstBoard || null);
        if (firstBoard) {
          localStorage.setItem(CURRENT_BOARD_KEY, firstBoard);
        } else {
          localStorage.removeItem(CURRENT_BOARD_KEY);
        }
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  }, [boards, currentBoard]);

  const addCard = useCallback((
    position: { x: number; y: number }, 
    type: ContentType,
    dimensions?: { width: number; height: number },
    initialContent?: string
  ) => {
    if (!currentBoard) return;

    const newCard = createCard(type, position, initialContent || '', dimensions || {
      width: FIXED_CARD_WIDTH,
      height: FIXED_CARD_HEIGHT
    });
    
    if (type === 'app-kanban') {
      newCard.metadata = { boardId: currentBoard };
    }
    
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
      const newCard = createCard('link', position, url, {
        width: FIXED_CARD_WIDTH,
        height: FIXED_CARD_HEIGHT
      });
      newCard.metadata = metadata;

      setBoards(prevBoards => prevBoards.map(board => 
        board.id === currentBoard
          ? { ...board, cards: [...(board.cards || []), newCard] }
          : board
      ));
      
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

  const updateCardMetadata = useCallback((cardId: string, metadata: any) => {
    setBoards(prevBoards => prevBoards.map(board => ({
      ...board,
      cards: board.cards?.map(card => 
        card.id === cardId ? { ...card, metadata } : card
      ) || []
    })));

    const currentBoardData = boards.find(b => b.id === currentBoard);
    if (currentBoardData?.cards) {
      const updatedCards = currentBoardData.cards.map(card =>
        card.id === cardId ? { ...card, metadata } : card
      );
      database.saveCards(currentBoard!, updatedCards)
        .then(() => setUnsavedChanges(false))
        .catch(error => console.error('Error saving card metadata:', error));
    }
  }, [boards, currentBoard]);

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

  const autoArrangeCards = useCallback(() => {
    if (!currentBoard) return;

    setBoards(prevBoards => prevBoards.map(board => {
      if (board.id !== currentBoard) return board;

      const cards = [...(board.cards || [])];
      const totalCards = cards.length;
      const cardsPerRow = Math.ceil(totalCards / ROWS);

      const arrangedCards = cards.map((card, index) => {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;

        return {
          ...card,
          position: {
            x: CARD_MARGIN + col * (FIXED_CARD_WIDTH + CARD_MARGIN),
            y: CARD_MARGIN + row * (FIXED_CARD_HEIGHT + CARD_MARGIN)
          },
          dimensions: {
            width: FIXED_CARD_WIDTH,
            height: FIXED_CARD_HEIGHT
          }
        };
      });

      return { ...board, cards: arrangedCards };
    }));

    setUnsavedChanges(true);
  }, [currentBoard]);

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
    updateCardMetadata,
    loadBoards,
    saveBoards,
    hasUnsavedChanges,
    currentBoardData: currentBoard ? boards.find(b => b.id === currentBoard) : null,
    autoArrangeCards
  };
}
