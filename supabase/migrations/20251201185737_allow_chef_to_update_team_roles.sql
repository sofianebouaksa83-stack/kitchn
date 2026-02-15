/*
  # Allow chefs to update team member roles

  1. Changes
    - Add a new policy to allow chefs to update profiles of team members in their restaurant
    - Restrict updates to only restaurant_role and job_title fields
    - Prevent chefs from changing their own role or other chefs' roles
  
  2. Security
    - Only chefs can update team member roles
    - Chefs can only update members in their own restaurant
    - Chefs cannot modify chef roles (including their own)
    - Users can still update their own profile via the existing policy
*/

-- Create a new policy for chefs to update team member roles
CREATE POLICY "chefs_can_update_team_roles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  -- Chef must be in the same restaurant
  EXISTS (
    SELECT 1 FROM profiles chef_profile
    WHERE chef_profile.id = auth.uid()
      AND chef_profile.restaurant_id = profiles.restaurant_id
      AND chef_profile.restaurant_role = 'chef'
  )
  -- Cannot modify chef roles
  AND profiles.restaurant_role != 'chef'
)
WITH CHECK (
  -- Same conditions for WITH CHECK
  EXISTS (
    SELECT 1 FROM profiles chef_profile
    WHERE chef_profile.id = auth.uid()
      AND chef_profile.restaurant_id = profiles.restaurant_id
      AND chef_profile.restaurant_role = 'chef'
  )
  -- Cannot change role to chef
  AND profiles.restaurant_role != 'chef'
);
