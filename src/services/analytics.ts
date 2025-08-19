import { supabase } from '../lib/supabase';

export const analytics = {
  async getBoardsStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all boards for the user
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select(`
        id,
        name,
        is_main_board,
        cards (
          id,
          type,
          content
        )
      `)
      .eq('user_id', user.id);

    if (boardsError) throw boardsError;

    // Get kanban stats
    const { data: kanbanBoards, error: kanbanError } = await supabase
      .from('kanban_boards')
      .select(`
        id,
        board_id,
        kanban_tasks (
          id,
          status,
          priority
        )
      `)
      .in('board_id', boards?.map(b => b.id) || []);

    if (kanbanError) throw kanbanError;

    return {
      boards: boards || [],
      kanbanBoards: kanbanBoards || []
    };
  }
};