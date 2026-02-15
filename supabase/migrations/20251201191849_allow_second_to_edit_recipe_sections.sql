/*
  # Permettre aux seconds de modifier les sections de recettes

  1. Problème
    - Les seconds ne peuvent pas modifier les recipe_sections et section_ingredients
    - Les politiques RLS actuelles vérifient uniquement r.user_id = auth.uid()
    - Un second devrait pouvoir modifier toutes les recettes de son restaurant

  2. Solution
    - Modifier les politiques INSERT et UPDATE pour recipe_sections
    - Modifier les politiques INSERT et UPDATE pour section_ingredients
    - Permettre l'accès si l'utilisateur est chef OU second du restaurant

  3. Sécurité
    - Vérifier que l'utilisateur appartient au même restaurant que la recette
    - Vérifier que son rôle est 'chef' ou 'second'
    - Maintenir la restriction pour les autres rôles
*/

-- ============================================
-- RECIPE_SECTIONS : Politiques INSERT et UPDATE
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS recipe_sections_insert ON recipe_sections;
DROP POLICY IF EXISTS recipe_sections_update ON recipe_sections;

-- Créer les nouvelles politiques pour INSERT
CREATE POLICY "recipe_sections_insert"
  ON recipe_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = recipe_sections.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- Créer les nouvelles politiques pour UPDATE
CREATE POLICY "recipe_sections_update"
  ON recipe_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = recipe_sections.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = recipe_sections.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- SECTION_INGREDIENTS : Politiques INSERT et UPDATE
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS section_ingredients_insert ON section_ingredients;
DROP POLICY IF EXISTS section_ingredients_update ON section_ingredients;

-- Créer les nouvelles politiques pour INSERT
CREATE POLICY "section_ingredients_insert"
  ON section_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE rs.id = section_ingredients.section_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- Créer les nouvelles politiques pour UPDATE
CREATE POLICY "section_ingredients_update"
  ON section_ingredients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE rs.id = section_ingredients.section_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_sections rs
      JOIN recipes r ON r.id = rs.recipe_id
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE rs.id = section_ingredients.section_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );
