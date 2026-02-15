/*
  # Optimize Recipe Shares RLS Policies

  ## Changes
  Simplify recipe_shares policies to avoid potential recursion issues
  and improve performance by removing nested queries where possible.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view shares of their recipes or shares to them" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can create shares" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can update shares" ON recipe_shares;
DROP POLICY IF EXISTS "Recipe owners can delete shares" ON recipe_shares;

-- New optimized policies

-- SELECT: Users can view shares involving them
CREATE POLICY "Users can view relevant shares"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    shared_with_user_id = auth.uid() OR
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- INSERT: Recipe owners can create shares
CREATE POLICY "Recipe owners can share"
  ON recipe_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- UPDATE: Recipe owners can update shares
CREATE POLICY "Recipe owners can update shares"
  ON recipe_shares FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- DELETE: Recipe owners can delete shares
CREATE POLICY "Recipe owners can delete shares"
  ON recipe_shares FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );