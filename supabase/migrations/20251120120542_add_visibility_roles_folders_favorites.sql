/*
  # Ajout visibilité, rôles hiérarchiques, dossiers et favoris

  1. Nouvelles colonnes
    - recipes.is_visible (boolean) : masquer recettes aux employés
    - recipes.folder_id (uuid) : organiser recettes en dossiers

  2. Nouvelles tables
    - recipe_folders : dossiers de recettes par restaurant
    - favorite_recipes : favoris par utilisateur

  3. Rôles hiérarchiques
    - chef : tout gérer
    - second : créer/modifier recettes, gérer dossiers
    - commis : lecture seule (respect is_visible)
    - stagiaire : lecture seule (respect is_visible)

  4. RLS mis à jour
    - Visibilité : commis/stagiaire ne voient que is_visible=true
    - Permissions : chef=full, second=edit, commis/stagiaire=read
*/

-- ============================================
-- 1. AJOUTER COLONNES is_visible ET folder_id
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE recipes ADD COLUMN is_visible boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN folder_id uuid;
  END IF;
END $$;

-- ============================================
-- 2. CRÉER TABLE recipe_folders
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_folders_restaurant ON recipe_folders(restaurant_id);

-- Ajouter la contrainte FK après création de la table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'recipes_folder_id_fkey'
  ) THEN
    ALTER TABLE recipes ADD CONSTRAINT recipes_folder_id_fkey
    FOREIGN KEY (folder_id) REFERENCES recipe_folders(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recipes_folder_id ON recipes(folder_id);

-- ============================================
-- 3. CRÉER TABLE favorite_recipes
-- ============================================

CREATE TABLE IF NOT EXISTS favorite_recipes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_recipes_user ON favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_recipes_recipe ON favorite_recipes(recipe_id);

-- ============================================
-- 4. RLS POUR recipe_folders
-- ============================================

ALTER TABLE recipe_folders ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les membres du restaurant
CREATE POLICY "Restaurant members can view folders"
  ON recipe_folders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipe_folders.restaurant_id
    )
  );

-- Création/modification/suppression : chef et second seulement
CREATE POLICY "Chef and second can manage folders"
  ON recipe_folders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipe_folders.restaurant_id
        AND profiles.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipe_folders.restaurant_id
        AND profiles.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- 5. RLS POUR favorite_recipes
-- ============================================

ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON favorite_recipes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 6. METTRE À JOUR RLS recipes (visibilité + rôles)
-- ============================================

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can view recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
DROP POLICY IF EXISTS "Restaurant members can view recipes" ON recipes;
DROP POLICY IF EXISTS "Chef can manage all recipes" ON recipes;
DROP POLICY IF EXISTS "Employees can view recipes" ON recipes;

-- SELECT : Hiérarchie avec visibilité
-- chef/second : voient TOUTES les recettes du restaurant
-- commis/stagiaire : voient SEULEMENT is_visible=true du restaurant
CREATE POLICY "Restaurant members can view recipes by role"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipes.restaurant_id
        AND (
          -- Chef et second voient tout
          profiles.restaurant_role IN ('chef', 'second')
          -- Commis et stagiaire voient uniquement is_visible=true
          OR (profiles.restaurant_role IN ('commis', 'stagiaire') AND recipes.is_visible = true)
        )
    )
  );

-- INSERT : chef et second seulement
CREATE POLICY "Chef and second can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipes.restaurant_id
        AND profiles.restaurant_role IN ('chef', 'second')
    )
  );

-- UPDATE : chef et second seulement
CREATE POLICY "Chef and second can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipes.restaurant_id
        AND profiles.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipes.restaurant_id
        AND profiles.restaurant_role IN ('chef', 'second')
    )
  );

-- DELETE : chef seulement
CREATE POLICY "Chef can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.restaurant_id = recipes.restaurant_id
        AND profiles.restaurant_role = 'chef'
    )
  );