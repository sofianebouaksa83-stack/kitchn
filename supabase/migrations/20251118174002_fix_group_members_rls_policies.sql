/*
  # Fix Group Members RLS Policies - Remove Infinite Recursion

  ## Problem
  The group_members policies were causing infinite recursion because they were
  checking group_members table within the group_members policies themselves.

  ## Solution
  Simplify the policies to avoid self-referential queries:
  - Users can view group members if they are the group creator OR a member
  - Group creators can manage all members
  - Remove recursive checks that caused the infinite loop

  ## Changes
  1. Drop existing problematic policies
  2. Create simplified, non-recursive policies
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON group_members;
DROP POLICY IF EXISTS "Group admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON group_members;

-- New simplified policies without recursion

-- SELECT: Users can view members of groups they created or are members of
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    )
  );

-- INSERT: Only group creators can add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    )
  );

-- UPDATE: Only group creators can update member roles
CREATE POLICY "Group creators can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    )
  );

-- DELETE: Group creators can remove members, or users can leave groups
CREATE POLICY "Group creators can remove members or users can leave"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    ) OR
    user_id = auth.uid()
  );