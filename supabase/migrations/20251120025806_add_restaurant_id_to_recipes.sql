/*
  # Add Restaurant Support to Recipes

  1. Changes to Recipes Table
    - Add restaurant_id column to recipes table
    - Link recipes to restaurants (foreign key)
    - Populate restaurant_id for existing recipes from user's profile
    - Add index for performance

  2. Security
    - RLS policies will be updated in next migration to use restaurant_id

  3. Important Notes
    - Existing recipes will be linked to their creator's restaurant
    - Recipes from users without a restaurant will have NULL restaurant_id (orphaned)
*/

-- Add restaurant_id column to recipes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Populate restaurant_id for existing recipes based on the user's profile
UPDATE recipes
SET restaurant_id = profiles.restaurant_id
FROM profiles
WHERE recipes.user_id = profiles.id
  AND profiles.restaurant_id IS NOT NULL
  AND recipes.restaurant_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_recipes_restaurant_id ON recipes(restaurant_id);

-- Add index on user_id + restaurant_id for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_restaurant ON recipes(user_id, restaurant_id);