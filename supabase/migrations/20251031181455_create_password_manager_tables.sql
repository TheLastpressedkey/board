/*
  # Create password manager tables

  1. New Tables
    - `passwords`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `service_name` (text) - Name of the service
      - `username` (text) - Username/email for the service
      - `encrypted_password` (text) - Encrypted password
      - `url` (text, optional) - Website URL
      - `notes` (text, optional) - Additional notes
      - `category` (text) - Category (social, email, banking, etc.)
      - `is_favorite` (boolean) - Favorite status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_used_at` (timestamptz, optional)

  2. Security
    - Enable RLS on `passwords` table
    - Add policy for authenticated users to manage only their own passwords
    - Policies for SELECT, INSERT, UPDATE, DELETE operations

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on category for filtering
*/

CREATE TABLE IF NOT EXISTS passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  username text NOT NULL,
  encrypted_password text NOT NULL,
  url text,
  notes text,
  category text DEFAULT 'other',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passwords"
  ON passwords FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords"
  ON passwords FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords"
  ON passwords FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords"
  ON passwords FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
CREATE INDEX IF NOT EXISTS idx_passwords_is_favorite ON passwords(is_favorite);
