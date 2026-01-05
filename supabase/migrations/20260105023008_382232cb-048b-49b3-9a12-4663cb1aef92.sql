-- Migration: Auto-Sync Provider Availability Display
-- Purpose: Automatically update providers.next_available_date from real availability_slots

-- Function to calculate and update next available slot
CREATE OR REPLACE FUNCTION public.sync_provider_next_available()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_id UUID;
  v_next_slot RECORD;
BEGIN
  -- Determine which provider_id to update
  IF TG_OP = 'DELETE' THEN
    v_provider_id := OLD.provider_id;
  ELSE
    v_provider_id := NEW.provider_id;
  END IF;

  -- Get the next available slot for this provider
  SELECT 
    DATE(start_time) as next_date,
    start_time::TIME as next_time
  INTO v_next_slot
  FROM availability_slots
  WHERE provider_id = v_provider_id
    AND slot_type = 'available'
    AND start_time >= NOW()
  ORDER BY start_time
  LIMIT 1;

  -- Update the providers table
  UPDATE providers
  SET 
    next_available_date = v_next_slot.next_date,
    next_available_time = v_next_slot.next_time,
    updated_at = NOW()
  WHERE provider_profile_id = v_provider_id;

  -- If no available slots, set to NULL
  IF v_next_slot.next_date IS NULL THEN
    UPDATE providers
    SET 
      next_available_date = NULL,
      next_available_time = NULL,
      updated_at = NOW()
    WHERE provider_profile_id = v_provider_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger to auto-sync on availability changes
DROP TRIGGER IF EXISTS trigger_sync_provider_availability ON availability_slots;

CREATE TRIGGER trigger_sync_provider_availability
AFTER INSERT OR UPDATE OR DELETE ON availability_slots
FOR EACH ROW
EXECUTE FUNCTION sync_provider_next_available();

-- Helper function for manual sync
CREATE OR REPLACE FUNCTION public.sync_all_provider_availability()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider RECORD;
  v_next_slot RECORD;
BEGIN
  FOR v_provider IN 
    SELECT DISTINCT provider_profile_id 
    FROM providers 
    WHERE provider_profile_id IS NOT NULL
  LOOP
    -- Get next available slot
    SELECT 
      DATE(start_time) as next_date,
      start_time::TIME as next_time
    INTO v_next_slot
    FROM availability_slots
    WHERE provider_id = v_provider.provider_profile_id
      AND slot_type = 'available'
      AND start_time >= NOW()
    ORDER BY start_time
    LIMIT 1;

    -- Update providers table
    UPDATE providers
    SET 
      next_available_date = v_next_slot.next_date,
      next_available_time = v_next_slot.next_time,
      updated_at = NOW()
    WHERE provider_profile_id = v_provider.provider_profile_id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION sync_provider_next_available() IS 
'Automatically syncs providers.next_available_date/time from availability_slots. Triggered on availability changes.';

COMMENT ON FUNCTION sync_all_provider_availability() IS 
'Manually sync all providers next available slots. Run after bulk updates.';