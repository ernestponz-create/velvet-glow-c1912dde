-- Fix RLS policy for availability_slots: Change from RESTRICTIVE to PERMISSIVE
-- so clients can actually read available slots from approved providers

DROP POLICY IF EXISTS "Clients can view available slots for approved providers" ON availability_slots;

CREATE POLICY "Clients can view available slots for approved providers"
ON availability_slots
FOR SELECT
TO authenticated
USING (
  slot_type = 'available' 
  AND provider_id IN (
    SELECT id FROM provider_profiles WHERE status = 'approved'
  )
);