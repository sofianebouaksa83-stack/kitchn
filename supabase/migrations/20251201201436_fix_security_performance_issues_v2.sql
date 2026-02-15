/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes on Foreign Keys
    - `ingredients.sub_recipe_id`
    - `recipe_shares.shared_by`
    - `recipe_shares.shared_with_group_id`
    - `recipe_shares.shared_with_user_id`
    - `section_ingredients.ingredient_id`

  2. Optimize RLS Policies
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
    - This prevents re-evaluation for each row, improving performance

  3. Remove Unused Indexes
    - `idx_recipes_folder_id`
    - `idx_group_members_group_id`
    - `idx_recipes_is_visible`

  4. Fix Function Search Path
    - Set immutable search_path for `auto_fill_restaurant_id`

  5. Consolidate Multiple Permissive Policies
    - Merge profiles UPDATE policies into single comprehensive policy
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for ingredients.sub_recipe_id
CREATE INDEX IF NOT EXISTS idx_ingredients_sub_recipe_id 
ON ingredients(sub_recipe_id) 
WHERE sub_recipe_id IS NOT NULL;

-- Index for recipe_shares.shared_by
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_by 
ON recipe_shares(shared_by);

-- Index for recipe_shares.shared_with_group_id
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_with_group_id 
ON recipe_shares(shared_with_group_id) 
WHERE shared_with_group_id IS NOT NULL;

-- Index for recipe_shares.shared_with_user_id
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_with_user_id 
ON recipe_shares(shared_with_user_id) 
WHERE shared_with_user_id IS NOT NULL;

-- Index for section_ingredients.ingredient_id
CREATE INDEX IF NOT EXISTS idx_section_ingredients_ingredient_id 
ON section_ingredients(ingredient_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_recipes_folder_id;
DROP INDEX IF EXISTS idx_group_members_group_id;
DROP INDEX IF EXISTS idx_recipes_is_visible;

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Drop trigger first, then function, then recreate both
DROP TRIGGER IF EXISTS set_restaurant_id_on_recipe_insert ON recipes;
DROP TRIGGER IF EXISTS trigger_auto_fill_restaurant_id ON recipes;
DROP FUNCTION IF EXISTS auto_fill_restaurant_id();

CREATE OR REPLACE FUNCTION auto_fill_restaurant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.restaurant_id IS NULL THEN
    SELECT restaurant_id INTO NEW.restaurant_id
    FROM profiles
    WHERE id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_restaurant_id_on_recipe_insert
  BEFORE INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION auto_fill_restaurant_id();

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- ============================================================================
-- RECIPES TABLE
-- ============================================================================

DROP POLICY IF EXISTS recipes_select ON recipes;
DROP POLICY IF EXISTS recipes_insert ON recipes;
DROP POLICY IF EXISTS recipes_update ON recipes;
DROP POLICY IF EXISTS recipes_delete ON recipes;

CREATE POLICY recipes_select ON recipes
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM profiles 
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY recipes_insert ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM profiles 
      WHERE id = (select auth.uid()) 
      AND restaurant_role IN ('chef', 'second')
    )
  );

CREATE POLICY recipes_update ON recipes
  FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM profiles 
      WHERE id = (select auth.uid()) 
      AND restaurant_role IN ('chef', 'second')
    )
  );

CREATE POLICY recipes_delete ON recipes
  FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM profiles 
      WHERE id = (select auth.uid()) 
      AND restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================================================
-- INGREDIENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS ingredients_select ON ingredients;
DROP POLICY IF EXISTS ingredients_insert ON ingredients;
DROP POLICY IF EXISTS ingredients_update ON ingredients;
DROP POLICY IF EXISTS ingredients_delete ON ingredients;

CREATE POLICY ingredients_select ON ingredients
  FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid())
      )
    )
  );

CREATE POLICY ingredients_insert ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

CREATE POLICY ingredients_update ON ingredients
  FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

CREATE POLICY ingredients_delete ON ingredients
  FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

-- ============================================================================
-- RECIPE_SECTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS recipe_sections_select ON recipe_sections;
DROP POLICY IF EXISTS recipe_sections_insert ON recipe_sections;
DROP POLICY IF EXISTS recipe_sections_update ON recipe_sections;
DROP POLICY IF EXISTS recipe_sections_delete ON recipe_sections;

CREATE POLICY recipe_sections_select ON recipe_sections
  FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid())
      )
    )
  );

CREATE POLICY recipe_sections_insert ON recipe_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

CREATE POLICY recipe_sections_update ON recipe_sections
  FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

CREATE POLICY recipe_sections_delete ON recipe_sections
  FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes 
      WHERE restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role IN ('chef', 'second')
      )
    )
  );

-- ============================================================================
-- SECTION_INGREDIENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS section_ingredients_select ON section_ingredients;
DROP POLICY IF EXISTS section_ingredients_insert ON section_ingredients;
DROP POLICY IF EXISTS section_ingredients_update ON section_ingredients;
DROP POLICY IF EXISTS section_ingredients_delete ON section_ingredients;

CREATE POLICY section_ingredients_select ON section_ingredients
  FOR SELECT
  TO authenticated
  USING (
    section_id IN (
      SELECT id FROM recipe_sections 
      WHERE recipe_id IN (
        SELECT id FROM recipes 
        WHERE restaurant_id IN (
          SELECT restaurant_id 
          FROM profiles 
          WHERE id = (select auth.uid())
        )
      )
    )
  );

CREATE POLICY section_ingredients_insert ON section_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    section_id IN (
      SELECT id FROM recipe_sections 
      WHERE recipe_id IN (
        SELECT id FROM recipes 
        WHERE restaurant_id IN (
          SELECT restaurant_id 
          FROM profiles 
          WHERE id = (select auth.uid()) 
          AND restaurant_role IN ('chef', 'second')
        )
      )
    )
  );

CREATE POLICY section_ingredients_update ON section_ingredients
  FOR UPDATE
  TO authenticated
  USING (
    section_id IN (
      SELECT id FROM recipe_sections 
      WHERE recipe_id IN (
        SELECT id FROM recipes 
        WHERE restaurant_id IN (
          SELECT restaurant_id 
          FROM profiles 
          WHERE id = (select auth.uid()) 
          AND restaurant_role IN ('chef', 'second')
        )
      )
    )
  );

CREATE POLICY section_ingredients_delete ON section_ingredients
  FOR DELETE
  TO authenticated
  USING (
    section_id IN (
      SELECT id FROM recipe_sections 
      WHERE recipe_id IN (
        SELECT id FROM recipes 
        WHERE restaurant_id IN (
          SELECT restaurant_id 
          FROM profiles 
          WHERE id = (select auth.uid()) 
          AND restaurant_role IN ('chef', 'second')
        )
      )
    )
  );

-- ============================================================================
-- GROUP_MEMBERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS group_members_select ON group_members;
DROP POLICY IF EXISTS group_members_insert ON group_members;
DROP POLICY IF EXISTS group_members_update ON group_members;
DROP POLICY IF EXISTS group_members_delete ON group_members;

CREATE POLICY group_members_select ON group_members
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY group_members_insert ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY group_members_update ON group_members
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY group_members_delete ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PROFILES TABLE - Consolidate Multiple UPDATE Policies
-- ============================================================================

DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS chefs_can_update_team_roles ON profiles;

-- Single comprehensive UPDATE policy that handles both cases
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own profile
    id = (select auth.uid())
    OR
    -- Chefs can update team member roles in their restaurant
    (
      restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role = 'chef'
      )
    )
  )
  WITH CHECK (
    -- Users can update their own profile
    id = (select auth.uid())
    OR
    -- Chefs can update team member roles in their restaurant
    (
      restaurant_id IN (
        SELECT restaurant_id 
        FROM profiles 
        WHERE id = (select auth.uid()) 
        AND restaurant_role = 'chef'
      )
    )
  );
