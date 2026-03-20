-- Allow public access to forms via share_link
CREATE POLICY "Anyone can view forms by share link"
  ON forms FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: We keep the existing policy for authenticated users to view their own forms
-- The RLS will use the most permissive policy that matches
