-- Add user_id to friends table and new profile fields
ALTER TABLE public.friends 
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN photo_url TEXT,
  ADD COLUMN discord_username TEXT,
  ADD COLUMN interests TEXT,
  ADD COLUMN why_not_want TEXT;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can view friend profiles" ON public.friends;
DROP POLICY IF EXISTS "Anyone can create friend profiles" ON public.friends;
DROP POLICY IF EXISTS "Anyone can update friend profiles" ON public.friends;

-- Create new restrictive policies
CREATE POLICY "Anyone can view friend profiles"
  ON public.friends
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create friend profiles"
  ON public.friends
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend profiles"
  ON public.friends
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friend profiles"
  ON public.friends
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create secure voting function to prevent vote manipulation
CREATE OR REPLACE FUNCTION public.vote_on_friend(
  friend_id UUID,
  vote_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF vote_type = 'keep' THEN
    UPDATE friends 
    SET keeps_count = keeps_count + 1 
    WHERE id = friend_id;
  ELSIF vote_type = 'cross' THEN
    UPDATE friends 
    SET cross_offs_count = cross_offs_count + 1 
    WHERE id = friend_id;
  ELSE
    RAISE EXCEPTION 'Invalid vote type';
  END IF;
END;
$$;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text from 1 for 8))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('friend-photos', 'friend-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for friend photos
CREATE POLICY "Anyone can view friend photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'friend-photos');

CREATE POLICY "Authenticated users can upload friend photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'friend-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'friend-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );