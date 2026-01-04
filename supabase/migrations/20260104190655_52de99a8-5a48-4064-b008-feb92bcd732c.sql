-- Add market pricing and actual price columns to bookings table for savings calculation
ALTER TABLE public.bookings 
ADD COLUMN market_highest_price numeric NULL,
ADD COLUMN price_paid numeric NULL;