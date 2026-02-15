/*
  # Fix Recipe Shares Infinite Recursion

  ## Problem
  Recipe shares policies were referencing recipes table, causing recursion.

  ## Solution
  Remove all subqueries that check the recipes table.

  ## Changes
  1. Drop all existing policies
  2. Create simple policies based only on direct column checks
*/

-- Drop ALL existing policies on recipe_shares
DROP POLICY IF EXISTS "Users can view relevant shares" ON recipe_shares;
DROP POLICY IF EXISTS "Users can view shares of their recipes or shares to them" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can share" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can create shares" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can update shares" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can delete shares" ON recipe_shares;

-- New SIMPLE policies without recursion

-- SELECT: Users can view shares they created or received
CREATE POLICY "Users view their shares"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    shared_with_user_id = auth.uid()
  );

-- INSERT: Users can create shares (we'll validate recipe ownership in app)
CREATE POLICY "Users create shares"
  ON recipe_shares FOR INSERT
  TO authenticated
  WITH CHECK (shared_by = auth.uid());

-- UPDATE: Users can update shares they created
CREATE POLICY "Users update their shares"
  ON recipe_shares FOR UPDATE
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- DELETE: Users can delete shares they created
CREATE POLICY "Users delete their shares"
  ON recipe_shares FOR DELETE
  TO authenticated
  USING (shared_by = auth.uid());