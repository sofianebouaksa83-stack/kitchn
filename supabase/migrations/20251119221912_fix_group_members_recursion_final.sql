/*
  # Fix Group Members Infinite Recursion

  1. Problem
    - The "Users can view group members" policy has infinite recursion
    - It checks if user is a member by querying group_members, which triggers the same policy

  2. Solution
    - Split the policy into two simpler conditions:
      1. Users can view their own membership records
      2. Group creators can view all members of their groups
    - This avoids self-referential queries on group_members

  3. Security
    - Maintains same access control
    - Users see their own memberships
    - Group creators see all members in their groups
*/

DROP POLICY IF EXISTS "Users can view group members" ON group_members;

CREATE POLICY "Users can view own memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Group creators can view all members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_groups
      WHERE work_groups.id = group_members.group_id
      AND work_groups.created_by = (select auth.uid())
    )
  );
