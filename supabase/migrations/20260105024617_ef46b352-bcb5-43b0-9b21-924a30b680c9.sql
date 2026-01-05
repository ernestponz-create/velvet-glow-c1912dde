-- Ensure proper RLS policies on availability_slots
-- Drop any conflicting policies and recreate clean ones

-- First, drop all existing policies on availability_slots
DROP POLICY IF EXISTS "Clients can view available slots for approved providers" ON availability_slots;
DROP POLICY IF EXISTS "Providers can manage own slots" ON availability_slots;

-- Create permissive policy for clients to view available slots
CREATE POLICY "Anyone authenticated can view available slots"
ON availability_slots
FOR SELECT
TO authenticated
USING (
  slot_type = 'available' 
  AND provider_id IN (
    SELECT id FROM provider_profiles WHERE status = 'approved'
  )
);

-- Create policy for providers to manage their own slots (all operations)
CREATE POLICY "Providers can manage own slots"
ON availability_slots
FOR ALL
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);