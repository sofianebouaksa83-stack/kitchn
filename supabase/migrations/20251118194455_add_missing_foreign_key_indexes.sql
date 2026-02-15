/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add index on `recipe_shares.shared_by` for foreign key performance
    - Add index on `section_ingredients.ingredient_id` for foreign key performance
    - Add index on `work_groups.created_by` for foreign key performance

  2. Security
    - No changes to RLS policies in this migration
    - Indexes improve query performance without affecting security
*/

-- Add index for recipe_shares.shared_by foreign key
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_by 
ON recipe_shares(shared_by);

-- Add index for section_ingredients.ingredient_id foreign key
CREATE INDEX IF NOT EXISTS idx_section_ingredients_ingredient_id 
ON section_ingredients(ingredient_id);

-- Add index for work_groups.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_work_groups_created_by 
ON work_groups(created_by);
