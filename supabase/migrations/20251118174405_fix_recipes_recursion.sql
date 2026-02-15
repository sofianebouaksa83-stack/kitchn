/*
  # Fix Recipes Infinite Recursion - Final Fix

  ## Problem
  The recipes policies are causing infinite recursion when they check recipe_shares.

  ## Solution
  Create completely non-recursive policies by:
  1. Removing all subqueries from the basic operations
  2. Handling shared recipe access at the application layer
  3. Only using direct user_id checks in RLS

  ## Changes
  1. Drop all existing policies
  2. Create simple, direct policies without subqueries
*/

-- Drop ALL existing policies on recipes
DROP POLICY IF EXISTS "Users can view accessible recipes" ON recipes;
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes they own or have edit access" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes or recipes with edit permission" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- New SIMPLE policies without ANY subqueries

-- SELECT: Users can ONLY view their own recipes
-- (Shared recipes will be accessed via service role or application logic)
CREATE POLICY "Users view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Users can create recipes
CREATE POLICY "Users create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can ONLY update their own recipes
CREATE POLICY "Users update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can ONLY delete their own recipes
CREATE POLICY "Users delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());