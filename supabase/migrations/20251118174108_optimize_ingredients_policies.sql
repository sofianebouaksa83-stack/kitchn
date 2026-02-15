/*
  # Optimize Ingredients RLS Policies

  ## Changes
  Simplify ingredients policies to follow parent recipe permissions
  without complex nested queries.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view ingredients of accessible recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients to own recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can update ingredients of editable recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients of own recipes" ON ingredients;

-- New optimized policies

-- SELECT: Users can view ingredients if they can view the recipe
CREATE POLICY "Users can view ingredients of accessible recipes"
  ON ingredients FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE user_id = auth.uid() OR
      id IN (SELECT recipe_id FROM recipe_shares WHERE shared_with_user_id = auth.uid())
    )
  );

-- INSERT: Users can add ingredients to their own recipes
CREATE POLICY "Users can add ingredients to own recipes"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- UPDATE: Users can update ingredients of recipes they own or have edit access
CREATE POLICY "Users can update ingredients of editable recipes"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    ) OR
    recipe_id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    )
  )
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    ) OR
    recipe_id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    )
  );

-- DELETE: Users can delete ingredients from their own recipes
CREATE POLICY "Users can delete ingredients from own recipes"
  ON ingredients FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );