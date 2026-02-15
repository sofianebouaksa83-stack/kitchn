/*
  # Fix récursion infinie + auto-création restaurant

  1. Supprime les policies récursives sur group_members et work_groups
  2. Recrée des policies simples sans récursion
  3. Crée automatiquement un restaurant pour tous les users sans restaurant
*/

-- ============================================
-- 1. SUPPRIMER POLICIES RÉCURSIVES
-- ============================================

DROP POLICY IF EXISTS "members_select" ON group_members;
DROP POLICY IF EXISTS "members_modify" ON group_members;
DROP POLICY IF EXISTS "groups_select" ON work_groups;
DROP POLICY IF EXISTS "groups_insert" ON work_groups;
DROP POLICY IF EXISTS "groups_update" ON work_groups;
DROP POLICY IF EXISTS "groups_delete" ON work_groups;

-- ============================================
-- 2. RECRÉER POLICIES SANS RÉCURSION
-- ============================================

-- group_members : policies simples
CREATE POLICY "group_members_select" 
  ON group_members FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR group_id IN (
    SELECT id FROM work_groups WHERE created_by = auth.uid()
  ));

CREATE POLICY "group_members_insert" 
  ON group_members FOR INSERT 
  TO authenticated 
  WITH CHECK (group_id IN (
    SELECT id FROM work_groups WHERE created_by = auth.uid()
  ));

CREATE POLICY "group_members_update" 
  ON group_members FOR UPDATE 
  TO authenticated 
  USING (group_id IN (
    SELECT id FROM work_groups WHERE created_by = auth.uid()
  ));

CREATE POLICY "group_members_delete" 
  ON group_members FOR DELETE 
  TO authenticated 
  USING (group_id IN (
    SELECT id FROM work_groups WHERE created_by = auth.uid()
  ));

-- work_groups : policies simples
CREATE POLICY "work_groups_select" 
  ON work_groups FOR SELECT 
  TO authenticated 
  USING (created_by = auth.uid());

CREATE POLICY "work_groups_insert" 
  ON work_groups FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "work_groups_update" 
  ON work_groups FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid());

CREATE POLICY "work_groups_delete" 
  ON work_groups FOR DELETE 
  TO authenticated 
  USING (created_by = auth.uid());

-- ============================================
-- 3. AUTO-CRÉER RESTAURANT POUR USERS EXISTANTS
-- ============================================

DO $$
DECLARE
  user_record RECORD;
  new_restaurant_id uuid;
BEGIN
  -- Pour chaque utilisateur qui n'a pas de restaurant
  FOR user_record IN
    SELECT DISTINCT p.id, p.email, p.full_name, p.establishment
    FROM profiles p
    WHERE p.restaurant_id IS NULL
  LOOP
    -- Créer un restaurant pour cet utilisateur
    INSERT INTO restaurants (name, owner_user_id)
    VALUES (
      COALESCE(user_record.establishment, user_record.full_name || '''s Restaurant', 'Mon Restaurant'),
      user_record.id
    )
    RETURNING id INTO new_restaurant_id;

    -- Mettre à jour le profil avec le restaurant_id et le rôle chef
    UPDATE profiles
    SET 
      restaurant_id = new_restaurant_id,
      restaurant_role = 'chef',
      updated_at = now()
    WHERE id = user_record.id;

    RAISE NOTICE 'Restaurant créé pour user %', user_record.id;
  END LOOP;
END $$;

-- ============================================
-- 4. TRIGGER AUTO-CRÉATION RESTAURANT POUR NOUVEAUX USERS
-- ============================================

CREATE OR REPLACE FUNCTION create_restaurant_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_restaurant_id uuid;
BEGIN
  -- Si le nouvel utilisateur n'a pas de restaurant_id
  IF NEW.restaurant_id IS NULL THEN
    -- Créer un restaurant automatiquement
    INSERT INTO restaurants (name, owner_user_id)
    VALUES (
      COALESCE(NEW.establishment, NEW.full_name || '''s Restaurant', 'Mon Restaurant'),
      NEW.id
    )
    RETURNING id INTO new_restaurant_id;

    -- Mettre à jour le profil
    NEW.restaurant_id := new_restaurant_id;
    NEW.restaurant_role := 'chef';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_restaurant_for_new_user ON profiles;

CREATE TRIGGER trigger_create_restaurant_for_new_user
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_restaurant_for_new_user();