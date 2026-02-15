/*
  # Optimize Recipes RLS Policies

  ## Changes
  Simplify and optimize recipe policies to improve performance and avoid
  potential recursion issues with complex nested queries.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes or recipes with edit permission" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- New optimized policies

-- SELECT: Users can view their own recipes and shared recipes
CREATE POLICY "Users can view accessible recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid()
    )
  );

-- INSERT: Users can create recipes
CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own recipes or recipes shared with edit permission
CREATE POLICY "Users can update recipes they own or have edit access"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    )
  );

-- DELETE: Users can only delete their own recipes
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);