-- Migration: Restrict Staff Member Visibility from Clients
-- Purpose: Prevent clients from viewing individual staff member information.
--          Only providers and admins should see staff details.

-- Drop the overly permissive policy that allows clients to view staff
DROP POLICY IF EXISTS "Clients can view staff of approved providers" ON public.staff_members;

-- Create new restrictive policy: Only providers and admins can view staff
CREATE POLICY "Only providers and admins can view staff"
ON public.staff_members
FOR SELECT
USING (
  -- The provider who owns this staff member
  provider_id IN (
    SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
  )
  OR
  -- OR the user is an admin
  public.has_role(auth.uid(), 'admin')
);

-- Add comment explaining the security decision
COMMENT ON POLICY "Only providers and admins can view staff" ON public.staff_members IS 
'Staff members are internal to the provider business. Clients should only see clinic-level information, not individual staff details. This prevents privacy violations and competitive intelligence gathering.';