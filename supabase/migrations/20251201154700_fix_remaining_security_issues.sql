/*
  # Fix Remaining Security and Performance Issues

  1. Performance Improvements
    - Add 3 missing foreign key indexes
    - Remove 6 unused indexes
    - Consolidate 5 duplicate RLS policies

  2. Security Improvements
    - Fix check_shift_conflicts function search_path

  3. Changes Summary
    - favorite_recipes: add recipe_id index
    - recipe_shares: add recipe_id index
    - recipes: add folder_id index
    - Remove 6 unused indexes from previous migration
    - Consolidate duplicate SELECT policies
    - Secure check_shift_conflicts function
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe_id
ON public.favorite_recipes(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe_id
ON public.recipe_shares(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipes_folder_id
ON public.recipes(folder_id)
WHERE folder_id IS NOT NULL;

-- =====================================================
-- PART 2: REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_ingredients_sub_recipe_id;
DROP INDEX IF EXISTS public.idx_recipe_shares_shared_by;
DROP INDEX IF EXISTS public.idx_recipe_shares_shared_with_group_id;
DROP INDEX IF EXISTS public.idx_recipe_shares_shared_with_user_id;
DROP INDEX IF EXISTS public.idx_section_ingredients_ingredient_id;
DROP INDEX IF EXISTS public.idx_work_groups_created_by;

-- =====================================================
-- PART 3: FIX FUNCTION SEARCH_PATH (SECURITY)
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_shift_conflicts(
  p_employee_id uuid,
  p_start_time timestamp with time zone,
  p_end_time timestamp with time zone,
  p_shift_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(conflicting_shift_id uuid, conflicting_title text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title
  FROM public.shifts s
  WHERE s.employee_id = p_employee_id
    AND s.status != 'CANCELLED'
    AND (p_shift_id IS NULL OR s.id != p_shift_id)
    AND (
      (s.start_time <= p_start_time AND s.end_time > p_start_time) OR
      (s.start_time < p_end_time AND s.end_time >= p_end_time) OR
      (s.start_time >= p_start_time AND s.end_time <= p_end_time)
    );
END;
$$;

-- =====================================================
-- PART 4: CONSOLIDATE RLS - INGREDIENTS
-- =====================================================

DROP POLICY IF EXISTS ingredients_select ON public.ingredients;
DROP POLICY IF EXISTS ingredients_modify ON public.ingredients;

CREATE POLICY ingredients_all ON public.ingredients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
      AND (
        recipes.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.restaurant_id = recipes.restaurant_id
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- PART 5: CONSOLIDATE RLS - RECIPE_FOLDERS
-- =====================================================

DROP POLICY IF EXISTS folders_select ON public.recipe_folders;
DROP POLICY IF EXISTS folders_modify ON public.recipe_folders;

CREATE POLICY folders_all ON public.recipe_folders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.restaurant_id = recipe_folders.restaurant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.restaurant_id = recipe_folders.restaurant_id
    )
  );

-- =====================================================
-- PART 6: CONSOLIDATE RLS - RECIPE_SECTIONS
-- =====================================================

DROP POLICY IF EXISTS sections_select ON public.recipe_sections;
DROP POLICY IF EXISTS sections_modify ON public.recipe_sections;

CREATE POLICY sections_all ON public.recipe_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_sections.recipe_id
      AND (
        recipes.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.restaurant_id = recipes.restaurant_id
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_sections.recipe_id
      AND recipes.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- PART 7: CONSOLIDATE RLS - RECIPE_SHARES
-- =====================================================

DROP POLICY IF EXISTS shares_select ON public.recipe_shares;
DROP POLICY IF EXISTS shares_modify ON public.recipe_shares;

CREATE POLICY shares_all ON public.recipe_shares
  FOR ALL
  TO authenticated
  USING (
    shared_by = (select auth.uid())
    OR shared_with_user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = recipe_shares.shared_with_group_id
      AND group_members.user_id = (select auth.uid())
    )
  )
  WITH CHECK (shared_by = (select auth.uid()));

-- =====================================================
-- PART 8: CONSOLIDATE RLS - SECTION_INGREDIENTS
-- =====================================================

DROP POLICY IF EXISTS section_ing_select ON public.section_ingredients;
DROP POLICY IF EXISTS section_ing_modify ON public.section_ingredients;

CREATE POLICY section_ing_all ON public.section_ingredients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipe_sections
      JOIN public.recipes ON recipes.id = recipe_sections.recipe_id
      WHERE recipe_sections.id = section_ingredients.section_id
      AND (
        recipes.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.restaurant_id = recipes.restaurant_id
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipe_sections
      JOIN public.recipes ON recipes.id = recipe_sections.recipe_id
      WHERE recipe_sections.id = section_ingredients.section_id
      AND recipes.user_id = (select auth.uid())
    )
  );