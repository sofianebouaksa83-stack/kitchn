/*
  # Permettre aux seconds de gérer toutes les recettes du restaurant

  1. Problème
    - Les seconds peuvent créer des recettes mais pas modifier/supprimer celles des autres
    - Les politiques UPDATE et DELETE vérifient user_id = auth.uid()
    - Un second devrait pouvoir gérer TOUTES les recettes de son restaurant

  2. Solution
    - Modifier la politique UPDATE pour permettre au second de modifier n'importe quelle recette du restaurant
    - Modifier la politique DELETE pour permettre au second de supprimer n'importe quelle recette du restaurant
    - Garder INSERT tel quel (user_id = auth.uid() est correct)

  3. Sécurité
    - Vérifier l'appartenance au restaurant
    - Autoriser chef et second uniquement
    - Le commis et stagiaire ne peuvent modifier que leurs propres recettes
*/

-- ============================================
-- RECIPES : Politique UPDATE
-- ============================================

DROP POLICY IF EXISTS recipes_update ON recipes;

CREATE POLICY "recipes_update"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (
    -- Soit c'est ma propre recette
    user_id = auth.uid()
    OR
    -- Soit je suis chef/second du même restaurant
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.restaurant_id = recipes.restaurant_id
        AND p.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    -- Soit c'est ma propre recette
    user_id = auth.uid()
    OR
    -- Soit je suis chef/second du même restaurant
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.restaurant_id = recipes.restaurant_id
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- RECIPES : Politique DELETE
-- ============================================

DROP POLICY IF EXISTS recipes_delete ON recipes;

CREATE POLICY "recipes_delete"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (
    -- Soit c'est ma propre recette
    user_id = auth.uid()
    OR
    -- Soit je suis chef/second du même restaurant
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.restaurant_id = recipes.restaurant_id
        AND p.restaurant_role IN ('chef', 'second')
    )
  );
