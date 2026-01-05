-- Fix the security definer view issue by setting security_invoker = true
-- This ensures the view runs with the permissions of the querying user

ALTER VIEW public.client_available_slots SET (security_invoker = true);