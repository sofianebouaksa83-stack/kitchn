/*
  # Add Recipe Sections and Sub-recipes Support

  1. Changes to recipes table
    - Add `instructions` JSONB field to store formatted instructions per section
    - Add `servings` integer field

  2. New Tables
    - `recipe_sections`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key to recipes)
      - `title` (text) - Section name like "Foie gras", "Sauce lie de vin", etc.
      - `instructions` (text) - Instructions for this section
      - `order` (integer) - Display order
      - `created_at` (timestamp)
    
    - `section_ingredients`
      - Links ingredients to specific sections
      - `id` (uuid, primary key)
      - `section_id` (uuid, foreign key to recipe_sections)
      - `ingredient_id` (uuid, foreign key to ingredients)
      - `order` (integer) - Display order within section
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add new columns to recipes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'instructions'
  ) THEN
    ALTER TABLE recipes ADD COLUMN instructions text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'servings'
  ) THEN
    ALTER TABLE recipes ADD COLUMN servings integer DEFAULT 4;
  END IF;
END $$;

-- Create recipe_sections table
CREATE TABLE IF NOT EXISTS recipe_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  instructions text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create section_ingredients junction table
CREATE TABLE IF NOT EXISTS section_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES recipe_sections(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(section_id, ingredient_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_sections_recipe_id ON recipe_sections(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_sections_order ON recipe_sections(recipe_id, order_index);
CREATE INDEX IF NOT EXISTS idx_section_ingredients_section ON section_ingredients(section_id);
CREATE INDEX IF NOT EXISTS idx_section_ingredients_order ON section_ingredients(section_id, order_index);

-- Enable RLS
ALTER TABLE recipe_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_sections
CREATE POLICY "Authenticated users view sections"
  ON recipe_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users insert sections"
  ON recipe_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users update sections"
  ON recipe_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users delete sections"
  ON recipe_sections FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for section_ingredients
CREATE POLICY "Authenticated users view section ingredients"
  ON section_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users insert section ingredients"
  ON section_ingredients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users update section ingredients"
  ON section_ingredients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users delete section ingredients"
  ON section_ingredients FOR DELETE
  TO authenticated
  USING (true);