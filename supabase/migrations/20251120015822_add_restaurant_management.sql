/*
  # Gestion Multi-Restaurant et Équipes

  Cette migration transforme l'application en système multi-restaurant avec gestion d'équipe.

  ## Tables Ajoutées:
  - restaurants: gestion des restaurants
  - invitations: système d'invitation d'employés

  ## Modifications:
  - profiles: ajout restaurant_id, restaurant_role, renommage role en job_title
  - recipes: ajout restaurant_id

  ## Sécurité RLS:
  - Les chefs peuvent tout faire dans leur restaurant
  - Les employees peuvent seulement consulter les recettes
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN role TO job_title;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'restaurant_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN restaurant_role text DEFAULT 'employee';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON profiles(restaurant_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_recipes_restaurant_id ON recipes(restaurant_id);

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'employee',
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_restaurant_id ON invitations(restaurant_id);

DO $$
DECLARE
  user_record RECORD;
  new_restaurant_id uuid;
BEGIN
  FOR user_record IN
    SELECT id, establishment FROM profiles WHERE restaurant_id IS NULL
  LOOP
    INSERT INTO restaurants (name, owner_user_id)
    VALUES (
      COALESCE(user_record.establishment, 'Mon Restaurant'),
      user_record.id
    )
    RETURNING id INTO new_restaurant_id;

    UPDATE profiles
    SET
      restaurant_id = new_restaurant_id,
      restaurant_role = 'chef'
    WHERE id = user_record.id;

    UPDATE recipes
    SET restaurant_id = new_restaurant_id
    WHERE user_id = user_record.id AND restaurant_id IS NULL;

  END LOOP;
END $$;

ALTER TABLE profiles ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid() OR
    id IN (SELECT restaurant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Restaurant owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Restaurant owners can delete their restaurant"
  ON restaurants FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant chefs can view invitations"
  ON invitations FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  );

CREATE POLICY "Restaurant chefs can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  );

CREATE POLICY "Restaurant chefs can delete invitations"
  ON invitations FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  );

DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes or recipes with edit permission" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

CREATE POLICY "Restaurant members can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Restaurant chefs can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Restaurant chefs can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  );

CREATE POLICY "Restaurant chefs can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles
      WHERE id = auth.uid() AND restaurant_role = 'chef'
    )
  );

DROP POLICY IF EXISTS "Users can view ingredients of accessible recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients to own recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can update ingredients of editable recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients of own recipes" ON ingredients;

CREATE POLICY "Restaurant members can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Restaurant chefs can insert ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = auth.uid() AND restaurant_role = 'chef'
      )
    )
  );

CREATE POLICY "Restaurant chefs can update ingredients"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = auth.uid() AND restaurant_role = 'chef'
      )
    )
  )
  WITH CHECK (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = auth.uid() AND restaurant_role = 'chef'
      )
    )
  );

CREATE POLICY "Restaurant chefs can delete ingredients"
  ON ingredients FOR DELETE
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes
      WHERE restaurant_id IN (
        SELECT restaurant_id FROM profiles
        WHERE id = auth.uid() AND restaurant_role = 'chef'
      )
    )
  );

CREATE OR REPLACE FUNCTION is_restaurant_chef(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND restaurant_role = 'chef'
  );
END;
$$;

CREATE OR REPLACE FUNCTION accept_invitation(invitation_token text, new_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM invitations
  WHERE token = invitation_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation invalide ou expirée'
    );
  END IF;

  UPDATE profiles
  SET
    restaurant_id = invitation_record.restaurant_id,
    restaurant_role = invitation_record.role
  WHERE id = new_user_id;

  UPDATE invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object(
    'success', true,
    'restaurant_id', invitation_record.restaurant_id
  );
END;
$$;