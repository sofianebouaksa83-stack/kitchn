/*
  # Fix Infinite Recursion in RLS Policies - CRITICAL FIX

  ## Problem
  Infinite recursion in group_members policies prevents ALL recipe operations.
  Users cannot create or import recipes.

  ## Changes
  1. **group_members**: Remove recursive self-reference in SELECT policy
  2. **recipes**: Simplify policies for direct access
  3. **ingredients**: Direct recipe ownership check
  4. **recipe_sections**: Direct recipe ownership check
  5. **section_ingredients**: Direct ownership via joins

  ## Security
  - Maintains authentication requirements
  - Preserves owner and restaurant team access
  - No security degradation

  ## Performance
  - Added indexes for all foreign keys
  - Simplified query plans
*/

-- ============================================================================
-- 1. FIX group_members POLICIES (Remove recursion)
-- ============================================================================

DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;

CREATE POLICY "group_members_select" ON group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM work_groups wg
      WHERE wg.id = group_members.group_id
      AND wg.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_insert" ON group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_groups wg
      WHERE wg.id = group_id
      AND wg.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_update" ON group_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_groups wg
      WHERE wg.id = group_id
      AND wg.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_groups wg
      WHERE wg.id = group_id
      AND wg.created_by = auth.uid()
    )
  );

CREATE POLICY "group_members_delete" ON group_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_groups wg
      WHERE wg.id = group_id
      AND wg.created_by = auth.uid()
    )
  );

-- ============================================================================
-- 2. FIX recipes POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "recipes_select" ON recipes;
DROP POLICY IF EXISTS "recipes_insert" ON recipes;
DROP POLICY IF EXISTS "recipes_update" ON recipes;
DROP POLICY IF EXISTS "recipes_delete" ON recipes;

CREATE POLICY "recipes_select" ON recipes
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR
    (is_visible = true AND restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "recipes_insert" ON recipes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recipes_update" ON recipes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recipes_delete" ON recipes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. FIX ingredients POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "ingredients_select" ON ingredients;
DROP POLICY IF EXISTS "ingredients_insert" ON ingredients;
DROP POLICY IF EXISTS "ingredients_update" ON ingredients;
DROP POLICY IF EXISTS "ingredients_delete" ON ingredients;

CREATE POLICY "ingredients_select" ON ingredients
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = ingredients.recipe_id
      AND (
        r.user_id = auth.uid()
        OR (r.is_visible = true AND r.restaurant_id IN (
          SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "ingredients_insert" ON ingredients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "ingredients_update" ON ingredients
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "ingredients_delete" ON ingredients
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. FIX recipe_sections POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "recipe_sections_select" ON recipe_sections;
DROP POLICY IF EXISTS "recipe_sections_insert" ON recipe_sections;
DROP POLICY IF EXISTS "recipe_sections_update" ON recipe_sections;
DROP POLICY IF EXISTS "recipe_sections_delete" ON recipe_sections;

CREATE POLICY "recipe_sections_select" ON recipe_sections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_sections.recipe_id
      AND (
        r.user_id = auth.uid()
        OR (r.is_visible = true AND r.restaurant_id IN (
          SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "recipe_sections_insert" ON recipe_sections
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_sections_update" ON recipe_sections
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_sections_delete" ON recipe_sections
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. FIX section_ingredients POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "section_ingredients_select" ON section_ingredients;
DROP POLICY IF EXISTS "section_ingredients_insert" ON section_ingredients;
DROP POLICY IF EXISTS "section_ingredients_update" ON section_ingredients;
DROP POLICY IF EXISTS "section_ingredients_delete" ON section_ingredients;

CREATE POLICY "section_ingredients_select" ON section_ingredients
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      WHERE rs.id = section_ingredients.section_id
      AND (
        r.user_id = auth.uid()
        OR (r.is_visible = true AND r.restaurant_id IN (
          SELECT restaurant_id FROM profiles WHERE id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "section_ingredients_insert" ON section_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      WHERE rs.id = section_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "section_ingredients_update" ON section_ingredients
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      WHERE rs.id = section_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      WHERE rs.id = section_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "section_ingredients_delete" ON section_ingredients
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      WHERE rs.id = section_id AND r.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. CREATE PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_work_groups_created_by ON work_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_restaurant_id ON recipes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_visible ON recipes(is_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_sections_recipe_id ON recipe_sections(recipe_id);
CREATE INDEX IF NOT EXISTS idx_section_ingredients_section_id ON section_ingredients(section_id);
