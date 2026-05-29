-- Profiles, ratings, aggregate cache tables

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  date_of_birth DATE,
  location TEXT,
  favourite_club_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  favourite_national_team_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  favourite_player_id BIGINT REFERENCES public.players (id) ON DELETE SET NULL,
  avatar_url TEXT,
  twitter_handle TEXT,
  reddit_handle TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.profile_followed_clubs (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, team_id)
);

CREATE INDEX profile_followed_clubs_team_id_idx ON public.profile_followed_clubs (team_id);

CREATE TABLE public.profile_interested_leagues (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  league_id BIGINT NOT NULL REFERENCES public.leagues (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, league_id)
);

CREATE TABLE public.career_ratings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  value NUMERIC(4, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, player_id),
  CONSTRAINT career_ratings_value_half_step CHECK (public.rating_half_step_check (value))
);

CREATE INDEX career_ratings_player_id_idx ON public.career_ratings (player_id);
CREATE INDEX career_ratings_user_id_idx ON public.career_ratings (user_id);

CREATE TRIGGER career_ratings_set_updated_at
  BEFORE UPDATE ON public.career_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.match_ratings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  value NUMERIC(4, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fixture_id, player_id),
  CONSTRAINT match_ratings_value_half_step CHECK (public.rating_half_step_check (value))
);

CREATE INDEX match_ratings_fixture_player_idx ON public.match_ratings (fixture_id, player_id);
CREATE INDEX match_ratings_user_id_idx ON public.match_ratings (user_id);

CREATE TRIGGER match_ratings_set_updated_at
  BEFORE UPDATE ON public.match_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.player_career_aggregates (
  player_id BIGINT PRIMARY KEY REFERENCES public.players (id) ON DELETE CASCADE,
  vote_count INT NOT NULL DEFAULT 0,
  mean_user_rating NUMERIC(4, 2),
  display_score NUMERIC(4, 2) NOT NULL,
  is_provisional BOOLEAN NOT NULL DEFAULT true,
  tier TEXT NOT NULL DEFAULT 'provisional',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.player_match_aggregates (
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  rating_count INT NOT NULL DEFAULT 0,
  avg_rating NUMERIC(4, 2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (fixture_id, player_id)
);

CREATE INDEX player_match_aggregates_player_id_idx ON public.player_match_aggregates (player_id);

CREATE TABLE public.player_form_snapshots (
  player_id BIGINT PRIMARY KEY REFERENCES public.players (id) ON DELETE CASCADE,
  last_5_avg NUMERIC(4, 2),
  last_5_fixture_ids BIGINT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.player_tournament_aggregates (
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  season_id BIGINT NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  avg_rating NUMERIC(4, 2),
  appearances_rated INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, season_id)
);

CREATE INDEX player_tournament_aggregates_season_id_idx
  ON public.player_tournament_aggregates (season_id);

-- Default career aggregate row when a player is synced
CREATE OR REPLACE FUNCTION public.init_player_career_aggregate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.player_career_aggregates (
    player_id,
    vote_count,
    mean_user_rating,
    display_score,
    is_provisional,
    tier
  )
  VALUES (
    NEW.id,
    0,
    NULL,
    COALESCE(NEW.fm_base_rating, 5.0),
    true,
    'provisional'
  )
  ON CONFLICT (player_id) DO NOTHING;

  INSERT INTO public.player_form_snapshots (player_id)
  VALUES (NEW.id)
  ON CONFLICT (player_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER players_init_career_aggregate
  AFTER INSERT ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.init_player_career_aggregate();

-- Bootstrap profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      'Fan'
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
