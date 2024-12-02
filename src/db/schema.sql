-- Drop existing tables if they exist
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS user_profiles;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    preferred_username TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create boards table
CREATE TABLE boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    is_main_board BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT,
    position_x DOUBLE PRECISION NOT NULL,
    position_y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_cards_board_id ON cards(board_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Boards policies
CREATE POLICY "Users can view their own boards"
    ON boards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards"
    ON boards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
    ON boards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
    ON boards FOR DELETE
    USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view cards in their boards"
    ON cards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = cards.board_id
        AND boards.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert cards in their boards"
    ON cards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = cards.board_id
        AND boards.user_id = auth.uid()
    ));

CREATE POLICY "Users can update cards in their boards"
    ON cards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = cards.board_id
        AND boards.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete cards in their boards"
    ON cards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM boards
        WHERE boards.id = cards.board_id
        AND boards.user_id = auth.uid()
    ));