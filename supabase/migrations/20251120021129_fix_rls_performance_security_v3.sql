/*
  # Fix RLS Performance and Security Issues (v3)

  Optimizes all RLS policies and fixes security issues:
  - Wraps auth.uid() with SELECT for better performance
  - Removes duplicate policies
  - Fixes function search_path
*/

-- =====================================================
-- 1. REMOVE DUPLICATE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users create recipes" ON recipes;
DROP POLICY IF EXISTS "Users update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users delete own recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users view ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users insert ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users update ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users delete ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can view own memberships" ON group_members;
DROP POLICY IF EXISTS "Group creators can view all members" ON group_members;

-- =====================================================
-- 2. RECREATE OPTIMIZED RECIPES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Restaurant members can view recipes" ON recipes;
CREATE POLICY "Restaurant members can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can create recipes" ON recipes;
CREATE POLICY "Restaurant chefs can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
    AND (SELECT auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Restaurant chefs can update recipes" ON recipes;
CREATE POLICY "Restaurant chefs can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can delete recipes" ON recipes;
CREATE POLICY "Restaurant chefs can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  );

-- =====================================================
-- 3. RECREATE OPTIMIZED INGREDIENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Restaurant members can view ingredients" ON ingredients;
CREATE POLICY "Restaurant members can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can insert ingredients" ON ingredients;
CREATE POLICY "Restaurant chefs can insert ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
      )
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can update ingredients" ON ingredients;
CREATE POLICY "Restaurant chefs can update ingredients"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
      )
    )
  )
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
      )
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can delete ingredients" ON ingredients;
CREATE POLICY "Restaurant chefs can delete ingredients"
  ON ingredients FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
      )
    )
  );

-- =====================================================
-- 4. OPTIMIZE RESTAURANTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their restaurant" ON restaurants;
CREATE POLICY "Users can view their restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (
    owner_user_id = (SELECT auth.uid()) OR
    id IN (SELECT restaurant_id FROM profiles WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Users can create restaurants" ON restaurants;
CREATE POLICY "Users can create restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_user_id);

DROP POLICY IF EXISTS "Restaurant owners can update their restaurant" ON restaurants;
CREATE POLICY "Restaurant owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_user_id)
  WITH CHECK ((SELECT auth.uid()) = owner_user_id);

DROP POLICY IF EXISTS "Restaurant owners can delete their restaurant" ON restaurants;
CREATE POLICY "Restaurant owners can delete their restaurant"
  ON restaurants FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_user_id);

-- =====================================================
-- 5. OPTIMIZE INVITATIONS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Restaurant chefs can view invitations" ON invitations;
CREATE POLICY "Restaurant chefs can view invitations"
  ON invitations FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can create invitations" ON invitations;
CREATE POLICY "Restaurant chefs can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  );

DROP POLICY IF EXISTS "Restaurant chefs can delete invitations" ON invitations;
CREATE POLICY "Restaurant chefs can delete invitations"
  ON invitations FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = (SELECT auth.uid()) AND restaurant_role = 'chef'
    )
  );

-- =====================================================
-- 6. OPTIMIZE WORK_GROUPS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view work groups" ON work_groups;
CREATE POLICY "Users can view work groups"
  ON work_groups FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid()) OR
    id IN (SELECT group_id FROM group_members WHERE user_id = (SELECT auth.uid()))
  );

-- =====================================================
-- 7. OPTIMIZE GROUP_MEMBERS POLICIES
-- =====================================================

CREATE POLICY "Users can view group memberships"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group creators can update members" ON group_members;
CREATE POLICY "Group creators can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group creators can remove members or users can leave" ON group_members;
CREATE POLICY "Group creators can remove members or users can leave"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = (SELECT auth.uid())
    ) OR
    user_id = (SELECT auth.uid())
  );

-- =====================================================
-- 8. OPTIMIZE RECIPE_SHARES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view recipe shares" ON recipe_shares;
CREATE POLICY "Users can view recipe shares"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = (SELECT auth.uid()) OR
    shared_with_user_id = (SELECT auth.uid()) OR
    shared_with_group_id IN (
      SELECT group_id FROM group_members WHERE user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 9. FIX FUNCTION SECURITY
-- =====================================================

CREATE OR REPLACE FUNCTION is_restaurant_chef(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND restaurant_role = 'chef'
  );
END;
$$;

CREATE OR REPLACE FUNCTION accept_invitation(invitation_token text, new_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM invitations
  WHERE token = invitation_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation invalide ou expirée'
    );
  END IF;

  UPDATE profiles
  SET
    restaurant_id = invitation_record.restaurant_id,
    restaurant_role = invitation_record.role
  WHERE id = new_user_id;

  UPDATE invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object(
    'success', true,
    'restaurant_id', invitation_record.restaurant_id
  );
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_group_member') THEN
    DROP FUNCTION is_group_member(uuid, uuid) CASCADE;
  END IF;
END $$;

CREATE FUNCTION is_group_member(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE user_id = p_user_id AND group_id = p_group_id
  );
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_group_creator') THEN
    DROP FUNCTION is_group_creator(uuid, uuid) CASCADE;
  END IF;
END $$;

CREATE FUNCTION is_group_creator(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM work_groups
    WHERE id = p_group_id AND created_by = p_user_id
  );
END;
$$;

-- =====================================================
-- 10. PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_restaurant ON recipes(user_id, restaurant_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id);