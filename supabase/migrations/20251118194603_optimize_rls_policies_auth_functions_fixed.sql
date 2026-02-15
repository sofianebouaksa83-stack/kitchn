/*
  # Optimize RLS Policies - Use (select auth.uid())

  1. Performance Improvements
    - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth functions for each row

  2. Tables Affected
    - profiles
    - import_jobs
    - group_members
    - work_groups
    - recipe_shares
    - recipes

  3. Security
    - No changes to security logic, only performance optimization
    - All policies maintain the same access control rules
*/

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- IMPORT_JOBS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can create own import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can update own import jobs" ON import_jobs;
DROP POLICY IF EXISTS "Users can delete own import jobs" ON import_jobs;

CREATE POLICY "Users can view own import jobs"
  ON import_jobs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own import jobs"
  ON import_jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own import jobs"
  ON import_jobs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own import jobs"
  ON import_jobs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- GROUP_MEMBERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can update members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members or users can leave" ON group_members;

CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_groups
      WHERE work_groups.id = group_members.group_id
      AND work_groups.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Group creators can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_groups
      WHERE work_groups.id = group_members.group_id
      AND work_groups.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_groups
      WHERE work_groups.id = group_members.group_id
      AND work_groups.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Group creators can remove members or users can leave"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM work_groups
      WHERE work_groups.id = group_members.group_id
      AND work_groups.created_by = (select auth.uid())
    )
  );

-- ============================================================================
-- WORK_GROUPS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view groups they created" ON work_groups;
DROP POLICY IF EXISTS "Users can view groups they're members of" ON work_groups;
DROP POLICY IF EXISTS "Users can create groups" ON work_groups;
DROP POLICY IF EXISTS "Group creators can update groups" ON work_groups;
DROP POLICY IF EXISTS "Group creators can delete groups" ON work_groups;

CREATE POLICY "Users can view groups they created"
  ON work_groups FOR SELECT
  TO authenticated
  USING (created_by = (select auth.uid()));

CREATE POLICY "Users can view groups they're members of"
  ON work_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = work_groups.id
      AND group_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create groups"
  ON work_groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Group creators can update groups"
  ON work_groups FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Group creators can delete groups"
  ON work_groups FOR DELETE
  TO authenticated
  USING (created_by = (select auth.uid()));

-- ============================================================================
-- RECIPE_SHARES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users view their shares" ON recipe_shares;
DROP POLICY IF EXISTS "Users view shares with them" ON recipe_shares;
DROP POLICY IF EXISTS "Users create shares" ON recipe_shares;
DROP POLICY IF EXISTS "Users update their shares" ON recipe_shares;
DROP POLICY IF EXISTS "Users delete their shares" ON recipe_shares;

CREATE POLICY "Users view their shares"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (shared_by = (select auth.uid()));

CREATE POLICY "Users view shares with them"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = recipe_shares.shared_with_group_id
      AND group_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users create shares"
  ON recipe_shares FOR INSERT
  TO authenticated
  WITH CHECK (shared_by = (select auth.uid()));

CREATE POLICY "Users update their shares"
  ON recipe_shares FOR UPDATE
  TO authenticated
  USING (shared_by = (select auth.uid()))
  WITH CHECK (shared_by = (select auth.uid()));

CREATE POLICY "Users delete their shares"
  ON recipe_shares FOR DELETE
  TO authenticated
  USING (shared_by = (select auth.uid()));

-- ============================================================================
-- RECIPES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users view shared recipes" ON recipes;
DROP POLICY IF EXISTS "Users create recipes" ON recipes;
DROP POLICY IF EXISTS "Users update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users delete own recipes" ON recipes;

CREATE POLICY "Users view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users view shared recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipe_shares rs
      WHERE rs.recipe_id = recipes.id
      AND (
        rs.shared_with_user_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = rs.shared_with_group_id
          AND gm.user_id = (select auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
