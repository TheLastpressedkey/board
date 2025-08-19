import { supabase } from '../lib/supabase';
import { Board, Card } from '../types';

export const database = {
  async getBoards() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('boards')
      .select(`
        id,
        name,
        is_main_board,
        created_at,
        updated_at,
        cards (
          id,
          type,
          content,
          position_x,
          position_y,
          width,
          height,
          metadata,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;

    return data?.map(board => ({
      id: board.id,
      name: board.name,
      isMainBoard: board.is_main_board,
      cards: (board.cards || []).map(card => ({
        id: card.id,
        type: card.type,
        content: card.content || '',
        position: {
          x: card.position_x,
          y: card.position_y
        },
        dimensions: {
          width: card.width || 300,
          height: card.height || 200
        },
        metadata: card.metadata
      }))
    })) || [];
  },

  async createBoard(name: string, isMainBoard: boolean = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if a main board already exists when trying to create a main board
    if (isMainBoard) {
      const { data: existingMainBoard } = await supabase
        .from('boards')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_main_board', true)
        .single();

      if (existingMainBoard) {
        throw new Error('Main board already exists');
      }
    }

    const { data: newBoard, error: insertError } = await supabase
      .from('boards')
      .insert({
        name,
        user_id: user.id,
        is_main_board: isMainBoard
      })
      .select('id, name, is_main_board')
      .single();

    if (insertError) throw insertError;

    return {
      id: newBoard.id,
      name: newBoard.name,
      isMainBoard: newBoard.is_main_board,
      cards: []
    };
  },

  async deleteBoard(boardId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if the board is not a main board before deleting
    const { data: board } = await supabase
      .from('boards')
      .select('is_main_board')
      .eq('id', boardId)
      .single();

    if (board?.is_main_board) {
      throw new Error('Cannot delete main board');
    }

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async saveCards(boardId: string, cards: Card[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, verify board ownership
    const { data: board } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .eq('user_id', user.id)
      .single();

    if (!board) throw new Error('Board not found or unauthorized');

    // Delete existing cards
    await supabase
      .from('cards')
      .delete()
      .eq('board_id', boardId);

    if (cards.length === 0) return;

    // Insert new cards
    const { error } = await supabase
      .from('cards')
      .insert(cards.map(card => ({
        board_id: boardId,
        id: card.id,
        type: card.type,
        content: card.content,
        position_x: card.position.x,
        position_y: card.position.y,
        width: card.dimensions?.width || 300,
        height: card.dimensions?.height || 200,
        metadata: card.metadata
      })));

    if (error) throw error;
  }
};