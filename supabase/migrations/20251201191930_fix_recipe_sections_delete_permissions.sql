/*
  # Corriger les permissions DELETE pour recipe_sections et section_ingredients

  1. Problème
    - Les politiques DELETE utilisent encore l'ancien système (r.user_id = auth.uid())
    - Les seconds ne peuvent pas supprimer des sections

  2. Solution
    - Mettre à jour les politiques DELETE pour recipe_sections
    - Mettre à jour les politiques DELETE pour section_ingredients
    - Permettre aux chefs et seconds de supprimer

  3. Sécurité
    - Vérifier l'appartenance au restaurant
    - Vérifier le rôle (chef ou second)
*/

-- ============================================
-- RECIPE_SECTIONS : Politique DELETE
-- ============================================

DROP POLICY IF EXISTS recipe_sections_delete ON recipe_sections;

CREATE POLICY "recipe_sections_delete"
  ON recipe_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.restaurant_id = r.restaurant_id
      WHERE r.id = recipe_sections.recipe_id
        AND p.id = auth.uid()
        AND p.restaurant_role IN ('chef', 'second')
    )
  );

-- ============================================
-- SECTION_INGREDIENTS : Politique DELETE
-- ============================================

DROP POLICY IF EXISTS section_ingredients_delete ON section_ingredients;

CREATE POLICY "section_ingredients_delete"
  ON section_ingredients
  FOR DELETE
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
  );
