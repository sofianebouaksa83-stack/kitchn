/*
  # Fix invitation signup trigger

  1. Changes
    - Modify handle_new_user() trigger to NOT create a restaurant when user signs up via invitation
    - Check for invitation_signup flag in user metadata
    - Still create profile but without restaurant_id for invitation signups
    
  2. Security
    - Maintains existing RLS policies
    - Trigger runs as SECURITY DEFINER
*/

-- Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  restaurant_id_var uuid;
  is_invitation_signup boolean;
BEGIN
  -- Check if this is an invitation signup
  is_invitation_signup := COALESCE((NEW.raw_user_meta_data->>'invitation_signup')::boolean, false);
  
  IF is_invitation_signup THEN
    -- For invitation signups, only create the profile without restaurant
    INSERT INTO public.profiles (
      id, 
      email,
      full_name,
      job_title
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'job_title', '')
    );
  ELSE
    -- Normal signup: create restaurant and profile
    INSERT INTO public.restaurants (name, owner_user_id)
    VALUES ('Mon Restaurant', NEW.id)
    RETURNING id INTO restaurant_id_var;

    INSERT INTO public.profiles (
      id, 
      email, 
      restaurant_id, 
      restaurant_role,
      full_name,
      job_title
    )
    VALUES (
      NEW.id,
      NEW.email,
      restaurant_id_var,
      'chef',
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'job_title', '')
    );
  END IF;

  RETURN NEW;
END;
$$;
