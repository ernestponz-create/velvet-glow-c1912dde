-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  procedure_slug TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  wants_virtual_consult BOOLEAN DEFAULT false,
  consult_preferred_date DATE,
  consult_preferred_time TEXT,
  investment_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for follow-up actions
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();