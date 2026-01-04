-- Create enum for membership tiers
CREATE TYPE public.membership_tier AS ENUM ('member', 'premium', 'luxury', 'elite');

-- Create member_benefits table to define tier benefits
CREATE TABLE public.member_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier membership_tier NOT NULL UNIQUE,
  spend_threshold NUMERIC NOT NULL DEFAULT 0,
  event_access_level TEXT NOT NULL DEFAULT 'standard',
  product_discount_percent INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_benefits ENABLE ROW LEVEL SECURITY;

-- Everyone can read benefits (public info)
CREATE POLICY "Benefits are viewable by authenticated users"
ON public.member_benefits
FOR SELECT
TO authenticated
USING (true);

-- Insert default tier benefits
INSERT INTO public.member_benefits (tier, spend_threshold, event_access_level, product_discount_percent, description) VALUES
  ('member', 0, 'standard', 0, 'Welcome to the club'),
  ('premium', 5000, 'priority', 5, 'Priority event access + 5% product discount'),
  ('luxury', 15000, 'vip', 10, 'VIP event access + 10% product discount'),
  ('elite', 50000, 'exclusive', 15, 'Exclusive events + 15% product discount');

-- Create a function to calculate user's total spend
CREATE OR REPLACE FUNCTION public.get_user_total_spend(_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(price_paid), 0)
  FROM public.bookings
  WHERE user_id = _user_id
    AND status IN ('confirmed', 'completed')
$$;

-- Create a function to get user's current tier based on spend
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id UUID)
RETURNS membership_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier
  FROM public.member_benefits
  WHERE spend_threshold <= public.get_user_total_spend(_user_id)
  ORDER BY spend_threshold DESC
  LIMIT 1
$$;

-- Add computed_tier column to profiles for easy access (will be updated by trigger)
ALTER TABLE public.profiles 
ADD COLUMN total_spend NUMERIC DEFAULT 0,
ADD COLUMN computed_tier membership_tier DEFAULT 'member';

-- Create function to update profile spend and tier
CREATE OR REPLACE FUNCTION public.update_user_spend_and_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total_spend NUMERIC;
  _new_tier membership_tier;
BEGIN
  -- Calculate total spend
  SELECT COALESCE(SUM(price_paid), 0) INTO _total_spend
  FROM public.bookings
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status IN ('confirmed', 'completed');
  
  -- Get tier based on spend
  SELECT tier INTO _new_tier
  FROM public.member_benefits
  WHERE spend_threshold <= _total_spend
  ORDER BY spend_threshold DESC
  LIMIT 1;
  
  -- Update profile
  UPDATE public.profiles
  SET total_spend = _total_spend,
      computed_tier = COALESCE(_new_tier, 'member')
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update spend/tier when bookings change
CREATE TRIGGER on_booking_change_update_tier
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_spend_and_tier();