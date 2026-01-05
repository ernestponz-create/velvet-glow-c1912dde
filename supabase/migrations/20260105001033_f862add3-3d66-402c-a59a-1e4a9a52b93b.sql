-- Create staff members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'practitioner',
  specialties TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint for role types
ALTER TABLE public.staff_members 
ADD CONSTRAINT staff_members_role_check 
CHECK (role IN ('practitioner', 'nurse', 'aesthetician', 'receptionist', 'manager'));

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own staff
CREATE POLICY "Providers can manage own staff"
ON public.staff_members
FOR ALL
USING (provider_id IN (
  SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
));

-- Clients can view staff of approved providers
CREATE POLICY "Clients can view staff of approved providers"
ON public.staff_members
FOR SELECT
USING (provider_id IN (
  SELECT id FROM public.provider_profiles WHERE status = 'approved'
));

-- Update availability_slots to reference staff_member instead of just provider
ALTER TABLE public.availability_slots 
ADD COLUMN staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_staff_members_provider ON public.staff_members(provider_id);
CREATE INDEX idx_availability_slots_staff ON public.availability_slots(staff_member_id);

-- Trigger for updated_at
CREATE TRIGGER update_staff_members_updated_at
BEFORE UPDATE ON public.staff_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();