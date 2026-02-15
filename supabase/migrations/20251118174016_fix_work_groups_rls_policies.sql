/*
  # Fix Work Groups RLS Policies - Remove Infinite Recursion

  ## Problem
  The work_groups policies were also potentially causing recursion by checking
  group_members within the work_groups policies.

  ## Solution
  Simplify to only check group creator, removing the member check that caused recursion.

  ## Changes
  1. Drop existing problematic policies
  2. Create simplified policies without recursive member checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON work_groups;
DROP POLICY IF EXISTS "Users can create work groups" ON work_groups;
DROP POLICY IF EXISTS "Group creators and admins can update groups" ON work_groups;
DROP POLICY IF EXISTS "Group creators can delete groups" ON work_groups;

-- New simplified policies

-- SELECT: Users can view groups they created
-- (We'll handle viewing groups as members through the application layer)
CREATE POLICY "Users can view groups they created"
  ON work_groups FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- INSERT: Users can create work groups
CREATE POLICY "Users can create groups"
  ON work_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: Only group creators can update groups
CREATE POLICY "Group creators can update groups"
  ON work_groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Only group creators can delete groups
CREATE POLICY "Group creators can delete groups"
  ON work_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);