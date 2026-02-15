/*
  # Cleanup Duplicate Policies

  ## Changes
  Remove old duplicate policies that were not properly dropped:
  - ingredients_all
  - sections_all
  - section_ing_all

  These are replaced by the specific SELECT/INSERT/UPDATE/DELETE policies.
*/

DROP POLICY IF EXISTS "ingredients_all" ON ingredients;
DROP POLICY IF EXISTS "sections_all" ON recipe_sections;
DROP POLICY IF EXISTS "section_ing_all" ON section_ingredients;
