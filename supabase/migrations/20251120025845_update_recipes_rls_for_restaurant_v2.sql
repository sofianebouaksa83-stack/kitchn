/*
  # Update Recipes RLS Policies for Restaurant-Based Access

  1. Changes to RLS Policies
    - DROP all existing recipe policies (comprehensive list)
    - CREATE new policies based on restaurant_id instead of user_id
    
  2. New Access Model
    - SELECT: All restaurant members (chef + employees) can VIEW recipes
    - INSERT: Only chefs can CREATE recipes
    - UPDATE: Only chefs can MODIFY recipes
    - DELETE: Only chefs can DELETE recipes

  3. Security Notes
    - Employees get read-only access to their restaurant's recipes
    - Chefs get full CRUD access to their restaurant's recipes
    - Users from different restaurants cannot see each other's recipes
*/

-- Drop ALL existing policies on recipes (comprehensive list)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'recipes' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON recipes', policy_record.policyname);
  END LOOP;
END $$;

-- =====================================================
-- NEW RESTAURANT-BASED POLICIES
-- =====================================================

-- SELECT: All members of the restaurant can VIEW recipes
-- (Both chef and employees)
CREATE POLICY "Restaurant members can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid()
      AND restaurant_id IS NOT NULL
    )
  );

-- INSERT: Only chefs can CREATE recipes
-- The recipe must belong to the chef's restaurant
CREATE POLICY "Restaurant chefs can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND restaurant_id = recipes.restaurant_id
      AND restaurant_role = 'chef'
    )
    AND user_id = auth.uid()
  );

-- UPDATE: Only chefs can MODIFY recipes in their restaurant
CREATE POLICY "Restaurant chefs can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND restaurant_id = recipes.restaurant_id
      AND restaurant_role = 'chef'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND restaurant_id = recipes.restaurant_id
      AND restaurant_role = 'chef'
    )
  );

-- DELETE: Only chefs can DELETE recipes in their restaurant
CREATE POLICY "Restaurant chefs can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND restaurant_id = recipes.restaurant_id
      AND restaurant_role = 'chef'
    )
  );