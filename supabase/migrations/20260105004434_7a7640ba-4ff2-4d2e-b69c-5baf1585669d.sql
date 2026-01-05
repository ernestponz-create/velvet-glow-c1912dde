
-- Add provider_profile_id to providers table to link display providers to actual provider accounts
ALTER TABLE public.providers 
ADD COLUMN provider_profile_id uuid REFERENCES public.provider_profiles(id);

-- Create index for faster lookups
CREATE INDEX idx_providers_profile_id ON public.providers(provider_profile_id);
