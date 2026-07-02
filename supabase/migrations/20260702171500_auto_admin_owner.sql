-- Auto-assign admin privileges and password for the owner

-- 1. Redefine public.has_role to return true for the owner email
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_owner_admin BOOLEAN;
BEGIN
  -- Standard check from user_roles table
  IF EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) THEN
    RETURN TRUE;
  END IF;

  -- Fail-safe check for the owner email
  IF _role = 'admin'::public.app_role THEN
    SELECT EXISTS (
      SELECT 1 
      FROM auth.users 
      WHERE id = _user_id 
        AND LOWER(email) = 'jamingtonbuluma17@gmail.com'
    ) INTO is_owner_admin;
    
    RETURN COALESCE(is_owner_admin, FALSE);
  END IF;

  RETURN FALSE;
END;
$$;

-- 2. Trigger function to automatically confirm owner's email and insert admin role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF LOWER(NEW.email) = 'jamingtonbuluma17@gmail.com' THEN
    -- Insert role into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    -- Auto-confirm email to bypass confirmation email requirement
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on auth.users (drop if exists to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 4. Update the password and role for the owner if they already exist in the database
-- Set password to 'LyonAdmin@2026#'
UPDATE auth.users
SET encrypted_password = crypt('LyonAdmin@2026#', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE LOWER(email) = 'jamingtonbuluma17@gmail.com';

-- Set role to 'admin'
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) = 'jamingtonbuluma17@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
