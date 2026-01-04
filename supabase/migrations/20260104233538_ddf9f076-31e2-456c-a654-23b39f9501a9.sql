
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'provider', 'admin');

-- Create user_roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create provider_profiles table
CREATE TABLE public.provider_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    clinic_name text NOT NULL,
    practice_type text NOT NULL CHECK (practice_type IN ('solo', 'multi_staff')),
    primary_specialty text NOT NULL,
    secondary_specialties text[] DEFAULT '{}',
    address text NOT NULL,
    city text NOT NULL,
    phone text NOT NULL,
    website text,
    profile_photo_url text,
    bio text,
    years_in_practice text,
    credentials text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason text,
    approved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on provider_profiles
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_profiles
CREATE POLICY "Providers can view own profile"
ON public.provider_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own profile"
ON public.provider_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert provider profile during signup"
ON public.provider_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create resources table (staff/rooms for clinics)
CREATE TABLE public.resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('practitioner', 'room', 'equipment')),
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS policies for resources
CREATE POLICY "Providers can manage own resources"
ON public.resources FOR ALL
USING (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
);

-- Create availability_slots table
CREATE TABLE public.availability_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
    resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    slot_type text NOT NULL DEFAULT 'available' CHECK (slot_type IN ('available', 'blocked', 'booked')),
    block_reason text,
    block_note text,
    is_recurring boolean DEFAULT false,
    recurrence_pattern jsonb,
    booking_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS on availability_slots
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for availability_slots
CREATE POLICY "Providers can manage own slots"
ON public.availability_slots FOR ALL
USING (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Clients can view available slots for approved providers"
ON public.availability_slots FOR SELECT
USING (
    slot_type = 'available' AND
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE status = 'approved'
    )
);

-- Add resource_id to bookings table
ALTER TABLE public.bookings ADD COLUMN resource_id uuid REFERENCES public.resources(id);

-- Trigger to auto-create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'provider' THEN 2 
      ELSE 3 
    END
  LIMIT 1
$$;

-- Function to get provider status
CREATE OR REPLACE FUNCTION public.get_provider_status(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.provider_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Update timestamps trigger for new tables
CREATE TRIGGER update_provider_profiles_updated_at
BEFORE UPDATE ON public.provider_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at
BEFORE UPDATE ON public.availability_slots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
