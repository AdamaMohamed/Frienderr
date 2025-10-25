-- Add sex field to friends table
ALTER TABLE friends ADD COLUMN sex TEXT CHECK (sex IN ('male', 'female', 'other'));

-- Create swipes table to track individual votes
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_id UUID REFERENCES friends(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('keep', 'cross')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on swipes
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for swipes
CREATE POLICY "Users can view their own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update vote_on_friend function to record individual swipes
CREATE OR REPLACE FUNCTION public.vote_on_friend(friend_id UUID, vote_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update vote counts
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
  
  -- Record individual swipe
  INSERT INTO swipes (user_id, friend_id, vote_type)
  VALUES (auth.uid(), friend_id, vote_type)
  ON CONFLICT (user_id, friend_id) DO UPDATE
  SET vote_type = EXCLUDED.vote_type;
END;
$$;

-- Function to check if two users have mutual "keep" swipes
CREATE OR REPLACE FUNCTION public.check_mutual_match(friend_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  friend_owner_id UUID;
  has_match BOOLEAN;
BEGIN
  -- Get the owner of the friend profile
  SELECT user_id INTO friend_owner_id FROM friends WHERE id = friend_id;
  
  -- Check if current user swiped keep on this friend AND friend owner swiped keep on current user's friend
  SELECT EXISTS (
    SELECT 1 FROM swipes s1
    WHERE s1.user_id = auth.uid() 
      AND s1.friend_id = friend_id 
      AND s1.vote_type = 'keep'
      AND EXISTS (
        SELECT 1 FROM swipes s2
        JOIN friends f ON s2.friend_id = f.id
        WHERE s2.user_id = friend_owner_id
          AND f.user_id = auth.uid()
          AND s2.vote_type = 'keep'
      )
  ) INTO has_match;
  
  RETURN has_match;
END;
$$;