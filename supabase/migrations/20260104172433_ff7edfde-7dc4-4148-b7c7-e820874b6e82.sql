-- Create procedures table
CREATE TABLE public.procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  benefit_phrase TEXT NOT NULL,
  investment_level TEXT NOT NULL CHECK (investment_level IN ('signature', 'premier', 'exclusive')),
  concerns TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INTEGER,
  recovery_days INTEGER,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- Public read access for procedures (catalog is public)
CREATE POLICY "Procedures are viewable by authenticated users"
ON public.procedures
FOR SELECT
TO authenticated
USING (true);

-- Create trigger for timestamp updates
CREATE TRIGGER update_procedures_updated_at
BEFORE UPDATE ON public.procedures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();