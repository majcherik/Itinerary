-- ============================================================================
-- Fix User Signup Function - Add Search Path
-- ============================================================================
-- Fixes the "relation 'profiles' does not exist" error during user signup
-- by adding SET search_path to the SECURITY DEFINER function
-- ============================================================================

-- Recreate handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert profile with email from auth.users
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );

    -- Insert default preferences
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$;
