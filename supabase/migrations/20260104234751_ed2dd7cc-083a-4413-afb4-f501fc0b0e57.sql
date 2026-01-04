
-- Create admin-specific RLS policies for provider management

-- Allow admins to view all provider profiles
CREATE POLICY "Admins can view all provider profiles"
ON public.provider_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update provider profiles (for approval/rejection)
CREATE POLICY "Admins can update all provider profiles"
ON public.provider_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert user roles (for promoting users)
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to get all providers (for admin use)
CREATE OR REPLACE FUNCTION public.get_all_providers()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  clinic_name text,
  practice_type text,
  primary_specialty text,
  city text,
  phone text,
  status text,
  created_at timestamptz,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pp.id,
    pp.user_id,
    pp.clinic_name,
    pp.practice_type,
    pp.primary_specialty,
    pp.city,
    pp.phone,
    pp.status,
    pp.created_at,
    au.email
  FROM public.provider_profiles pp
  JOIN auth.users au ON au.id = pp.user_id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY pp.created_at DESC
$$;

-- Function to approve a provider
CREATE OR REPLACE FUNCTION public.approve_provider(_provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE public.provider_profiles
  SET status = 'approved', approved_at = now()
  WHERE id = _provider_id;
  
  RETURN true;
END;
$$;

-- Function to reject a provider
CREATE OR REPLACE FUNCTION public.reject_provider(_provider_id uuid, _reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE public.provider_profiles
  SET status = 'rejected', rejection_reason = _reason
  WHERE id = _provider_id;
  
  RETURN true;
END;
$$;

-- Function to get provider details (for admin)
CREATE OR REPLACE FUNCTION public.get_provider_details(_provider_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  clinic_name text,
  practice_type text,
  primary_specialty text,
  secondary_specialties text[],
  address text,
  city text,
  phone text,
  website text,
  bio text,
  years_in_practice text,
  credentials text,
  status text,
  rejection_reason text,
  approved_at timestamptz,
  created_at timestamptz,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pp.id,
    pp.user_id,
    pp.clinic_name,
    pp.practice_type,
    pp.primary_specialty,
    pp.secondary_specialties,
    pp.address,
    pp.city,
    pp.phone,
    pp.website,
    pp.bio,
    pp.years_in_practice,
    pp.credentials,
    pp.status,
    pp.rejection_reason,
    pp.approved_at,
    pp.created_at,
    au.email
  FROM public.provider_profiles pp
  JOIN auth.users au ON au.id = pp.user_id
  WHERE pp.id = _provider_id
    AND public.has_role(auth.uid(), 'admin')
$$;
