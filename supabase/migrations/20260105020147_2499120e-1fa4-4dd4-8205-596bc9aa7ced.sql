-- Create client-safe availability view
-- This view shows available slots WITHOUT exposing staff member details

CREATE OR REPLACE VIEW public.client_available_slots AS
SELECT 
  a.id,
  a.provider_id,
  a.start_time,
  a.end_time,
  a.slot_type,
  p.clinic_name,
  p.city,
  p.status
FROM public.availability_slots a
JOIN public.provider_profiles p ON a.provider_id = p.id
WHERE 
  a.slot_type = 'available' 
  AND p.status = 'approved'
  AND a.start_time >= NOW();

-- Grant access to the client view
GRANT SELECT ON public.client_available_slots TO authenticated;

-- Add comment explaining the security decision
COMMENT ON VIEW public.client_available_slots IS 
'Client-safe view of available appointment slots. Intentionally excludes staff_member_id and resource_id to maintain provider privacy.';