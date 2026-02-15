/*
  # ChefConnect - Professional Recipe Management System

  ## Overview
  Complete database schema for a professional recipe management platform for restaurant professionals.

  ## 1. New Tables

  ### `profiles`
  Extended user profiles for restaurant professionals
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - Professional role (Chef, Sous-Chef, Pâtissier, etc.)
  - `establishment` (text) - Restaurant/establishment name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `recipes`
  Professional recipe technical sheets
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Recipe creator
  - `title` (text) - Recipe name
  - `category` (text) - Recipe category
  - `servings` (integer) - Base number of servings
  - `prep_time` (integer) - Preparation time in minutes
  - `cook_time` (integer) - Cooking time in minutes
  - `allergens` (text[]) - Array of allergens
  - `steps` (jsonb) - Preparation steps as JSON array
  - `notes` (text) - Additional notes
  - `is_base_recipe` (boolean) - If true, can be used as sub-recipe
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `ingredients`
  Recipe ingredients with quantities and units
  - `id` (uuid, primary key)
  - `recipe_id` (uuid, foreign key) - Parent recipe
  - `order_index` (integer) - Display order
  - `quantity` (decimal) - Ingredient quantity
  - `unit` (text) - Measurement unit (g, kg, L, mL, unité, etc.)
  - `designation` (text) - Ingredient name/description
  - `sub_recipe_id` (uuid, foreign key, nullable) - Link to another recipe as ingredient
  - `cost_per_unit` (decimal, nullable) - Cost for future costing feature
  - `created_at` (timestamptz)

  ### `work_groups`
  Collaboration groups for teams/establishments
  - `id` (uuid, primary key)
  - `name` (text) - Group name
  - `description` (text) - Group description
  - `created_by` (uuid, foreign key) - Group creator
  - `created_at` (timestamptz)

  ### `group_members`
  Members of work groups
  - `id` (uuid, primary key)
  - `group_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `role` (text) - Member role in group (admin, member)
  - `joined_at` (timestamptz)

  ### `recipe_shares`
  Recipe sharing and access control
  - `id` (uuid, primary key)
  - `recipe_id` (uuid, foreign key)
  - `shared_with_user_id` (uuid, foreign key, nullable) - Individual user share
  - `shared_with_group_id` (uuid, foreign key, nullable) - Group share
  - `permission` (text) - Access level (read, edit)
  - `shared_by` (uuid, foreign key) - User who shared
  - `shared_at` (timestamptz)

  ### `import_jobs`
  Track document import and processing jobs
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `file_name` (text) - Original filename
  - `file_type` (text) - File type (pdf, docx, image)
  - `status` (text) - Processing status (pending, processing, completed, failed)
  - `extracted_data` (jsonb) - Extracted recipe data
  - `created_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with appropriate policies:
  
  ### profiles
  - Users can view all profiles (for collaboration)
  - Users can only update their own profile
  
  ### recipes
  - Users can view recipes they own or have been shared with
  - Users can create their own recipes
  - Users can update/delete only their own recipes
  
  ### ingredients
  - Access follows parent recipe permissions
  
  ### work_groups
  - Members can view groups they belong to
  - Only creators/admins can update groups
  
  ### group_members
  - Members can view their group memberships
  - Only group admins can manage members
  
  ### recipe_shares
  - Users can view shares for their recipes or shares to them
  - Only recipe owners can create/delete shares
  
  ### import_jobs
  - Users can only view and manage their own imports

  ## 3. Indexes
  Performance indexes on frequently queried columns

  ## 4. Important Notes
  - All foreign keys have proper cascading deletes where appropriate
  - Timestamps use timestamptz for proper timezone handling
  - JSONB used for flexible structured data (steps, extracted_data)
  - Array type for allergens for easy querying
  - Decimal types for precise quantity and cost calculations
  - Sub-recipe linking enables complex recipe dependencies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'Cuisinier',
  establishment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text DEFAULT 'Autre',
  servings integer DEFAULT 4,
  prep_time integer DEFAULT 0,
  cook_time integer DEFAULT 0,
  allergens text[] DEFAULT '{}',
  steps jsonb DEFAULT '[]',
  notes text DEFAULT '',
  is_base_recipe boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  quantity decimal(10,3) NOT NULL,
  unit text NOT NULL,
  designation text NOT NULL,
  sub_recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  cost_per_unit decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Create work_groups table
CREATE TABLE IF NOT EXISTS work_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES work_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create recipe_shares table
CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_group_id uuid REFERENCES work_groups(id) ON DELETE CASCADE,
  permission text DEFAULT 'read',
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at timestamptz DEFAULT now(),
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_group_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_group_id IS NOT NULL)
  )
);

-- Create import_jobs table
CREATE TABLE IF NOT EXISTS import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  status text DEFAULT 'pending',
  extracted_data jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_base ON recipes(is_base_recipe);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_sub_recipe ON ingredients(sub_recipe_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe_id ON recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_user_id ON recipe_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_group_id ON recipe_shares(shared_with_group_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for recipes
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid()
    ) OR
    id IN (
      SELECT rs.recipe_id FROM recipe_shares rs
      INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes or recipes with edit permission"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    ) OR
    id IN (
      SELECT rs.recipe_id FROM recipe_shares rs
      INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
      WHERE gm.user_id = auth.uid() AND rs.permission = 'edit'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    ) OR
    id IN (
      SELECT rs.recipe_id FROM recipe_shares rs
      INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
      WHERE gm.user_id = auth.uid() AND rs.permission = 'edit'
    )
  );

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ingredients
CREATE POLICY "Users can view ingredients of accessible recipes"
  ON ingredients FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE user_id = auth.uid() OR
      id IN (SELECT recipe_id FROM recipe_shares WHERE shared_with_user_id = auth.uid()) OR
      id IN (
        SELECT rs.recipe_id FROM recipe_shares rs
        INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
        WHERE gm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert ingredients to own recipes"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update ingredients of editable recipes"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    ) OR
    recipe_id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    ) OR
    recipe_id IN (
      SELECT rs.recipe_id FROM recipe_shares rs
      INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
      WHERE gm.user_id = auth.uid() AND rs.permission = 'edit'
    )
  )
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    ) OR
    recipe_id IN (
      SELECT recipe_id FROM recipe_shares
      WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
    ) OR
    recipe_id IN (
      SELECT rs.recipe_id FROM recipe_shares rs
      INNER JOIN group_members gm ON rs.shared_with_group_id = gm.group_id
      WHERE gm.user_id = auth.uid() AND rs.permission = 'edit'
    )
  );

CREATE POLICY "Users can delete ingredients of own recipes"
  ON ingredients FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- RLS Policies for work_groups
CREATE POLICY "Users can view groups they are members of"
  ON work_groups FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create work groups"
  ON work_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators and admins can update groups"
  ON work_groups FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group creators can delete groups"
  ON work_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups
      WHERE created_by = auth.uid() OR
      id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Group admins can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM work_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for recipe_shares
CREATE POLICY "Users can view shares of their recipes or shares to them"
  ON recipe_shares FOR SELECT
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    shared_with_user_id = auth.uid() OR
    shared_with_group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Recipe owners can create shares"
  ON recipe_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

CREATE POLICY "Recipe owners can update shares"
  ON recipe_shares FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  )
  WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

CREATE POLICY "Recipe owners can delete shares"
  ON recipe_shares FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid())
  );

-- RLS Policies for import_jobs
CREATE POLICY "Users can view own import jobs"
  ON import_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own import jobs"
  ON import_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own import jobs"
  ON import_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own import jobs"
  ON import_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);