/*
  # Update accept_invitation to handle full_name and job_title

  1. Changes
    - Modify accept_invitation to accept full_name and job_title parameters
    - Update the ON CONFLICT clause to also update these fields
    
  2. Security
    - Maintains SECURITY DEFINER to bypass RLS
*/

CREATE OR REPLACE FUNCTION accept_invitation(
  invitation_token text, 
  new_user_id uuid,
  full_name text DEFAULT NULL,
  job_title text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  INSERT INTO profiles (
    id,
    restaurant_id,
    restaurant_role,
    full_name,
    job_title,
    updated_at
  )
  VALUES (
    new_user_id,
    invitation_record.restaurant_id,
    invitation_record.role,
    COALESCE(full_name, ''),
    COALESCE(job_title, ''),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    restaurant_id = EXCLUDED.restaurant_id,
    restaurant_role = EXCLUDED.restaurant_role,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    job_title = COALESCE(EXCLUDED.job_title, profiles.job_title),
    updated_at = now();

  UPDATE invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;

  RETURN json_build_object(
    'success', true,
    'restaurant_id', invitation_record.restaurant_id
  );
END;
$$;
