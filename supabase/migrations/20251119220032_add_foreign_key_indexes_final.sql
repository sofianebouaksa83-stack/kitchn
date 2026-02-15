/*
  # Add Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for all unindexed foreign keys
    - These indexes are critical for join performance and foreign key constraint checking
    - Improves query performance when filtering or joining on these columns

  2. Indexes Added
    - import_jobs.user_id
    - recipe_shares.shared_by
    - recipe_shares.shared_with_group_id
    - section_ingredients.ingredient_id
    - work_groups.created_by

  3. Security
    - No changes to RLS policies
    - Indexes improve performance without affecting security
*/

-- Add index for import_jobs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id 
ON import_jobs(user_id);

-- Add index for recipe_shares.shared_by foreign key
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_by 
ON recipe_shares(shared_by);

-- Add index for recipe_shares.shared_with_group_id foreign key
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_with_group_id 
ON recipe_shares(shared_with_group_id);

-- Add index for section_ingredients.ingredient_id foreign key
CREATE INDEX IF NOT EXISTS idx_section_ingredients_ingredient_id 
ON section_ingredients(ingredient_id);

-- Add index for work_groups.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_work_groups_created_by 
ON work_groups(created_by);
