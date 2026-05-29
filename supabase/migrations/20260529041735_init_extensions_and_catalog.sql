-- Penaltyboxd v1: extensions, helpers, catalog tables (API-Football BIGINT PKs)
-- See DATABASE.md

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.rating_half_step_check(p_value numeric)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_value >= 1.0
    AND p_value <= 10.0
    AND (p_value * 2) = floor(p_value * 2);
$$;

CREATE TABLE public.leagues (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER leagues_set_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.seasons (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  league_id BIGINT NOT NULL REFERENCES public.leagues (id) ON DELETE CASCADE,
  year INT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (league_id, year)
);

CREATE TABLE public.rounds (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id BIGINT NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT,
  UNIQUE (season_id, name)
);

CREATE TABLE public.teams (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  country TEXT,
  logo_url TEXT,
  is_national BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER teams_set_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.players (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  firstname TEXT,
  lastname TEXT,
  age INT,
  birth_date DATE,
  nationality TEXT,
  photo_url TEXT,
  primary_position TEXT,
  club_team_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  national_team_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  fm_base_rating NUMERIC(4, 2),
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX players_name_trgm_idx ON public.players USING gin (name gin_trgm_ops);
CREATE INDEX players_nationality_idx ON public.players (nationality);
CREATE INDEX players_primary_position_idx ON public.players (primary_position);
CREATE INDEX players_club_team_id_idx ON public.players (club_team_id);

CREATE TRIGGER players_set_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.player_season_squads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id BIGINT NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  UNIQUE (season_id, team_id, player_id)
);

CREATE TABLE public.fixtures (
  id BIGINT PRIMARY KEY,
  season_id BIGINT NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  round_id BIGINT REFERENCES public.rounds (id) ON DELETE SET NULL,
  round_name TEXT,
  home_team_id BIGINT NOT NULL REFERENCES public.teams (id),
  away_team_id BIGINT NOT NULL REFERENCES public.teams (id),
  venue TEXT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  status_short TEXT NOT NULL,
  status_long TEXT,
  home_goals_ft INT,
  away_goals_ft INT,
  home_goals_et INT,
  away_goals_et INT,
  home_goals_pen INT,
  away_goals_pen INT,
  winner_team_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  ratings_unlocked_at TIMESTAMPTZ,
  lineups_synced_at TIMESTAMPTZ,
  appearances_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX fixtures_season_kickoff_idx ON public.fixtures (season_id, kickoff_at);
CREATE INDEX fixtures_status_short_idx ON public.fixtures (status_short);
CREATE INDEX fixtures_kickoff_at_idx ON public.fixtures (kickoff_at);

CREATE TRIGGER fixtures_set_updated_at
  BEFORE UPDATE ON public.fixtures
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fixture_lineups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  shirt_number INT,
  formation_position TEXT,
  grid TEXT,
  UNIQUE (fixture_id, team_id, player_id)
);

CREATE TABLE public.fixture_appearances (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  minutes_played INT NOT NULL DEFAULT 0,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  position TEXT,
  is_rateable BOOLEAN GENERATED ALWAYS AS (minutes_played > 0) STORED,
  UNIQUE (fixture_id, player_id)
);

CREATE TABLE public.fixture_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES public.teams (id) ON DELETE SET NULL,
  player_id BIGINT REFERENCES public.players (id) ON DELETE SET NULL,
  assist_player_id BIGINT REFERENCES public.players (id) ON DELETE SET NULL,
  minute INT NOT NULL,
  extra_minute INT,
  type TEXT NOT NULL,
  detail TEXT
);

CREATE INDEX fixture_events_fixture_id_idx ON public.fixture_events (fixture_id);

INSERT INTO public.leagues (id, name, slug, country, is_active)
VALUES (1, 'FIFA World Cup', 'world-cup', NULL, true)
ON CONFLICT (id) DO NOTHING;
