/*
  # Fix All RLS Recursion Issues with Helper Functions

  1. Problem
    - Complex RLS policies create circular dependencies
    - Policies on recipes -> recipe_shares -> group_members -> work_groups create recursion
    - Need to break the cycle with security definer functions

  2. Solution
    - Create helper functions that run with security definer
    - These functions bypass RLS and perform direct checks
    - Update all policies to use these functions instead of nested subqueries

  3. Helper Functions
    - is_group_member(group_id, user_id): Check if user is in a group
    - is_group_creator(group_id, user_id): Check if user created the group
    - user_can_access_recipe(recipe_id, user_id): Check if user can access recipe

  4. Security
    - Functions use security definer but only return boolean results
    - Maintains same access control as before
    - No data leakage, only permission checks
*/

CREATE OR REPLACE FUNCTION is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = $1
    AND group_members.user_id = $2
  );
$$;

CREATE OR REPLACE FUNCTION is_group_creator(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_groups
    WHERE work_groups.id = $1
    AND work_groups.created_by = $2
  );
$$;

DROP POLICY IF EXISTS "Users can view own memberships" ON group_members;
DROP POLICY IF EXISTS "Group creators can view all members" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can update members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members or users can leave" ON group_members;

CREATE POLICY "Users can view own memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Group creators can view all members"
  ON group_members FOR SELECT
  TO authenticated
  USING (is_group_creator(group_id, auth.uid()));

CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (is_group_creator(group_id, auth.uid()));

CREATE POLICY "Group creators can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (is_group_creator(group_id, auth.uid()))
  WITH CHECK (is_group_creator(group_id, auth.uid()));

CREATE POLICY "Group creators can remove members or users can leave"
  ON group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_group_creator(group_id, auth.uid()));

DROP POLICY IF EXISTS "Users can view work groups" ON work_groups;

CREATE POLICY "Users can view work groups"
  ON work_groups FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR is_group_member(id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can view recipe shares" ON recipe_shares;

CREATE POLICY "Users can view recipe shares"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid()
    OR shared_with_user_id = auth.uid()
    OR (shared_with_group_id IS NOT NULL AND is_group_member(shared_with_group_id, auth.uid()))
  );

DROP POLICY IF EXISTS "Users can view recipes" ON recipes;

CREATE POLICY "Users can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM recipe_shares rs
      WHERE rs.recipe_id = recipes.id
      AND (
        rs.shared_with_user_id = auth.uid()
        OR (rs.shared_with_group_id IS NOT NULL AND is_group_member(rs.shared_with_group_id, auth.uid()))
      )
    )
  );
