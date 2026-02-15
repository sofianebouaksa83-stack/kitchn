/*
  # ChefConnect - Schéma complet

  Crée toutes les tables et policies nécessaires pour le système de recettes restaurant
*/

-- ============================================
-- 1. TABLES DE BASE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  job_title text DEFAULT 'Cuisinier',
  establishment text,
  restaurant_id uuid,
  restaurant_role text DEFAULT 'employee',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter FK après création de restaurants
ALTER TABLE profiles ADD CONSTRAINT profiles_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'employee',
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text DEFAULT 'Autre',
  servings integer DEFAULT 4,
  prep_time integer DEFAULT 0,
  cook_time integer DEFAULT 0,
  allergens text[] DEFAULT '{}',
  steps jsonb DEFAULT '[]',
  notes text DEFAULT '',
  is_base_recipe boolean DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  folder_id uuid,
  file_url text,
  file_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ADD CONSTRAINT recipes_folder_id_fkey 
  FOREIGN KEY (folder_id) REFERENCES recipe_folders(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS favorite_recipes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  quantity decimal(10,3) NOT NULL,
  unit text NOT NULL,
  designation text NOT NULL,
  sub_recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  cost_per_unit decimal(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipe_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS section_ingredients (
  section_id uuid NOT NULL REFERENCES recipe_sections(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS work_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES work_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_group_id uuid REFERENCES work_groups(id) ON DELETE CASCADE,
  permission text DEFAULT 'read',
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at timestamptz DEFAULT now(),
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_group_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_group_id IS NOT NULL)
  )
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON profiles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_restaurant_id ON invitations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_restaurant_id ON recipes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_folder_id ON recipes(folder_id);
CREATE INDEX IF NOT EXISTS idx_recipe_folders_restaurant ON recipe_folders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user ON favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe ON favorite_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_sections_recipe_id ON recipe_sections(recipe_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe_id ON recipe_shares(recipe_id);

-- ============================================
-- 3. RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Restaurants
CREATE POLICY "restaurants_select" ON restaurants FOR SELECT TO authenticated USING (
  owner_user_id = auth.uid() OR 
  id IN (SELECT restaurant_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "restaurants_insert" ON restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "restaurants_update" ON restaurants FOR UPDATE TO authenticated USING (owner_user_id = auth.uid());

-- Invitations (public read with token, chef manage)
CREATE POLICY "invitations_select_public" ON invitations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "invitations_insert" ON invitations FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = invitations.restaurant_id AND restaurant_role = 'chef')
);
CREATE POLICY "invitations_delete" ON invitations FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = invitations.restaurant_id AND restaurant_role = 'chef')
);

-- Recipes (avec visibilité et rôles)
CREATE POLICY "recipes_select" ON recipes FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.restaurant_id = recipes.restaurant_id
      AND (
        profiles.restaurant_role IN ('chef', 'second')
        OR (profiles.restaurant_role IN ('commis', 'stagiaire', 'employee') AND recipes.is_visible = true)
      )
  )
);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = recipes.restaurant_id AND restaurant_role IN ('chef', 'second'))
);
CREATE POLICY "recipes_update" ON recipes FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = recipes.restaurant_id AND restaurant_role IN ('chef', 'second'))
);
CREATE POLICY "recipes_delete" ON recipes FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = recipes.restaurant_id AND restaurant_role = 'chef')
);

-- Recipe folders
CREATE POLICY "folders_select" ON recipe_folders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = recipe_folders.restaurant_id)
);
CREATE POLICY "folders_all" ON recipe_folders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND restaurant_id = recipe_folders.restaurant_id AND restaurant_role IN ('chef', 'second'))
);

-- Favorite recipes
CREATE POLICY "favorites_all" ON favorite_recipes FOR ALL TO authenticated USING (user_id = auth.uid());

-- Ingredients
CREATE POLICY "ingredients_select" ON ingredients FOR SELECT TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes)
);
CREATE POLICY "ingredients_modify" ON ingredients FOR ALL TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);

-- Recipe sections
CREATE POLICY "sections_select" ON recipe_sections FOR SELECT TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes)
);
CREATE POLICY "sections_modify" ON recipe_sections FOR ALL TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);

-- Section ingredients
CREATE POLICY "section_ing_select" ON section_ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "section_ing_modify" ON section_ingredients FOR ALL TO authenticated USING (
  section_id IN (SELECT id FROM recipe_sections WHERE recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()))
);

-- Work groups
CREATE POLICY "groups_select" ON work_groups FOR SELECT TO authenticated USING (
  created_by = auth.uid() OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);
CREATE POLICY "groups_insert" ON work_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update" ON work_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "groups_delete" ON work_groups FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Group members
CREATE POLICY "members_select" ON group_members FOR SELECT TO authenticated USING (
  group_id IN (SELECT id FROM work_groups WHERE created_by = auth.uid() OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()))
);
CREATE POLICY "members_modify" ON group_members FOR ALL TO authenticated USING (
  group_id IN (SELECT id FROM work_groups WHERE created_by = auth.uid())
);

-- Recipe shares
CREATE POLICY "shares_select" ON recipe_shares FOR SELECT TO authenticated USING (
  shared_by = auth.uid() OR shared_with_user_id = auth.uid() OR 
  shared_with_group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);
CREATE POLICY "shares_modify" ON recipe_shares FOR ALL TO authenticated USING (
  recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
);