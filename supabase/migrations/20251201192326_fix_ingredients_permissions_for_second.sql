/*
  # Corriger les permissions pour la table ingredients

  1. Problème
    - Les seconds ne peuvent pas modifier les ingredients des recettes
    - Les politiques RLS vérifient uniquement r.user_id = auth.uid()
    - Erreur: "new row violates row-level security policy for table ingredients"

  2. Solution
    - Mettre à jour les politiques INSERT, UPDATE, DELETE pour ingredients
    - Permettre aux chefs et seconds du restaurant de modifier
    - Vérifier l'appartenance au restaurant via profiles

  3. Sécurité
    - Vérifier que l'utilisateur appartient au même restaurant
    - Autoriser uniquement les rôles 'chef' et 'second'
    - Bloquer les autres rôles (commis, stagiaire)
*/

-- ============================================
-- INGREDIENTS : Politique INSERT
-- ============================================

DROP POLICY IF EXISTS ingredients_insert ON ingredients;

CREATE POLICY "ingredients_insert"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = ingredients.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- INGREDIENTS : Politique UPDATE
-- ============================================

DROP POLICY IF EXISTS ingredients_update ON ingredients;

CREATE POLICY "ingredients_update"
  ON ingredients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = ingredients.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = ingredients.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- INGREDIENTS : Politique DELETE
-- ============================================

DROP POLICY IF EXISTS ingredients_delete ON ingredients;

CREATE POLICY "ingredients_delete"
  ON ingredients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = ingredients.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );
