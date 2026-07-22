
-- Allow admins to manage user_roles (grant/revoke admin) via RLS
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can grant roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can revoke roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Public function so the login page can decide whether to allow bootstrap signup
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO anon, authenticated;

-- Grant admin role to an existing auth user identified by email. Only callable by admins.
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem conceder acesso de admin';
  END IF;

  SELECT id INTO _target_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF _target_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum utilizador encontrado com esse email. Peça a essa pessoa para criar conta primeiro em /admin.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.grant_admin_by_email(text) TO authenticated;

-- Revoke admin role from a user by id (admins only). Prevents removing the last admin.
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem revogar acesso de admin';
  END IF;

  SELECT count(*) INTO _admin_count FROM public.user_roles WHERE role = 'admin';
  IF _admin_count <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
END;
$$;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;

-- List all admin users with their emails (admins only)
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem listar admins';
  END IF;

  RETURN QUERY
  SELECT ur.user_id, u.email::text, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
