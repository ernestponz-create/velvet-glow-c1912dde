-- Migration: Clear All Fake Static Data
-- Purpose: Remove hardcoded fake values that should be dynamically calculated

-- STEP 1: Clear fake availability dates from providers table
UPDATE providers 
SET 
  next_available_date = NULL,
  next_available_time = NULL,
  updated_at = NOW()
WHERE TRUE;

-- Add comments explaining field purpose
COMMENT ON COLUMN providers.next_available_date IS 
'Auto-populated by sync_provider_next_available() trigger. DO NOT set manually. NULL means no availability.';

COMMENT ON COLUMN providers.next_available_time IS 
'Auto-populated by sync_provider_next_available() trigger. DO NOT set manually. NULL means no availability.';

-- STEP 2: Clear fake recommendation_reason placeholders
UPDATE providers
SET recommendation_reason = NULL
WHERE recommendation_reason IN (
  'Top-rated injector with 12+ years experience',
  'Pioneer in combination treatments',
  'Highly recommended',
  'Top rated provider',
  'Excellent reviews'
);

-- STEP 3: Add comments about rating integrity
COMMENT ON COLUMN providers.rating IS 
'Should reflect real aggregated reviews. If review_count is 0, UI should show "No reviews yet" instead of a number.';

COMMENT ON COLUMN providers.review_count IS 
'Number of real reviews. UI should check this before displaying rating.';

-- STEP 4: Run sync to repopulate from real availability_slots data
SELECT sync_all_provider_availability();