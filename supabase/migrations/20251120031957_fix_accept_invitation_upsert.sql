/*
  # Fix accept_invitation to use UPSERT instead of UPDATE

  1. Problem
    - The current accept_invitation function uses UPDATE on profiles
    - If the profile doesn't exist (INSERT failed), the UPDATE fails silently
    - This leaves users without a profile

  2. Solution
    - Use INSERT ... ON CONFLICT DO UPDATE (UPSERT)
    - This ensures the profile is created if it doesn't exist
    - Or updated if it already exists

  3. Benefits
    - More robust employee onboarding
    - Handles edge cases where profile creation fails
    - No silent failures
*/

-- Remplacer la fonction accept_invitation avec UPSERT
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token text, new_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- 1. Récupérer l'invitation valide
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

  -- 2. UPSERT du profil (INSERT ou UPDATE selon si le profil existe)
  INSERT INTO profiles (
    id,
    restaurant_id,
    restaurant_role,
    updated_at
  )
  VALUES (
    new_user_id,
    invitation_record.restaurant_id,
    invitation_record.role,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    restaurant_id = EXCLUDED.restaurant_id,
    restaurant_role = EXCLUDED.restaurant_role,
    updated_at = now();

  -- 3. Marquer l'invitation comme acceptée
  UPDATE invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object(
    'success', true,
    'restaurant_id', invitation_record.restaurant_id
  );
END;
$$;