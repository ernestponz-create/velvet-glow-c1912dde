-- Migration: Clear All Fake Static Data
-- Purpose: Remove hardcoded fake values that should be dynamically calculated
-- Principle: Display data should reflect real state, not demo placeholders

-- ============================================
-- STEP 1: Clear fake availability dates from providers table
-- These should ONLY be populated by the auto-sync trigger from real availability_slots
-- ============================================

UPDATE providers 
SET 
  next_available_date = NULL,
  next_available_time = NULL,
  updated_at = NOW()
WHERE TRUE;

-- Add comments explaining field purposes
COMMENT ON COLUMN providers.next_available_date IS 
'Auto-populated by sync_provider_next_available() trigger. DO NOT set manually. NULL means no availability.';

COMMENT ON COLUMN providers.next_available_time IS 
'Auto-populated by sync_provider_next_available() trigger. DO NOT set manually. NULL means no availability.';

-- ============================================
-- STEP 2: Clear any fake recommendation_reason if they're generic placeholders
-- ============================================

UPDATE providers
SET recommendation_reason = NULL
WHERE recommendation_reason IN (
  'Top-rated injector with 12+ years experience',
  'Pioneer in combination treatments',
  'Highly recommended',
  'Top rated provider',
  'Excellent reviews',
  'Highest rated in Capitol Hill with earliest availability'
);

-- ============================================
-- STEP 3: Add comments for rating/review integrity
-- ============================================

COMMENT ON COLUMN providers.rating IS 
'Should reflect real aggregated reviews. If review_count is 0, UI should show "No reviews yet" instead of a number.';

COMMENT ON COLUMN providers.review_count IS 
'Number of real reviews. UI should check this before displaying rating.';

-- ============================================
-- STEP 4: Run the sync function to repopulate from real availability_slots data
-- This will set next_available_date/time ONLY for providers with real slots
-- ============================================

SELECT sync_all_provider_availability();