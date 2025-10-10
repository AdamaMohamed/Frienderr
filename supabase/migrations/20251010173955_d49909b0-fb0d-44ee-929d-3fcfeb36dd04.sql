-- Create friends table for storing friend profiles
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  useless_trait TEXT NOT NULL,
  tagline TEXT NOT NULL,
  keeps_count INTEGER NOT NULL DEFAULT 0,
  cross_offs_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all friend profiles (public access)
CREATE POLICY "Anyone can view friend profiles" 
ON public.friends 
FOR SELECT 
USING (true);

-- Allow anyone to insert new friend profiles (no auth needed)
CREATE POLICY "Anyone can create friend profiles" 
ON public.friends 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update vote counts
CREATE POLICY "Anyone can update friend profiles" 
ON public.friends 
FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_friends_created_at ON public.friends(created_at DESC);