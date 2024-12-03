-- Add theme column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN theme TEXT DEFAULT 'default';