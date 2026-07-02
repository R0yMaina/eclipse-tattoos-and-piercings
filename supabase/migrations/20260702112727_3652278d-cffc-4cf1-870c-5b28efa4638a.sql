
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email IN ('roymaina395@gmail.com','jamingtonbuluma17@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;

CREATE OR REPLACE FUNCTION public.grant_owner_admin_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) IN ('roymaina395@gmail.com','jamingtonbuluma17@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin_role();
