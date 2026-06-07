-- Separate Google and X profile photos; user picks which is shown publicly.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS x_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_source TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_source_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_source_check
  CHECK (avatar_source IS NULL OR avatar_source IN ('google', 'x'));

-- Existing single avatar_url values were mostly Google OAuth on signup.
UPDATE public.profiles
SET
  google_avatar_url = avatar_url,
  avatar_source = COALESCE(avatar_source, 'google')
WHERE avatar_url IS NOT NULL
  AND google_avatar_url IS NULL;

-- New signups: stash Google photo separately when present in OAuth metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  oauth_avatar TEXT;
BEGIN
  oauth_avatar := COALESCE(
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'picture'
  );

  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    google_avatar_url,
    avatar_source
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      'Fan'
    ),
    oauth_avatar,
    oauth_avatar,
    CASE WHEN oauth_avatar IS NOT NULL THEN 'google' ELSE NULL END
  );
  RETURN NEW;
END;
$$;
