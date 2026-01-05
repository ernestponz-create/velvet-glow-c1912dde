-- ============================================
-- FIX: Change availability_slots RLS policy from RESTRICTIVE to PERMISSIVE
-- This allows authenticated users to view available slots
-- ============================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone authenticated can view available slots" ON availability_slots;

-- Create a PERMISSIVE policy for viewing available slots
CREATE POLICY "Authenticated users can view available slots"
ON availability_slots
FOR SELECT
TO authenticated
USING (
  slot_type = 'available' 
  AND provider_id IN (
    SELECT id FROM provider_profiles WHERE status = 'approved'
  )
);

-- Keep the existing provider management policy but make sure it's permissive
DROP POLICY IF EXISTS "Providers can manage own slots" ON availability_slots;

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