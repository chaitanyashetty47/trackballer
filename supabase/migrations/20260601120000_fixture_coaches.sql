-- Head coaches per team per fixture (from API-Football lineups.coach)

CREATE TABLE public.fixture_coaches (
  fixture_id BIGINT NOT NULL REFERENCES public.fixtures (id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  PRIMARY KEY (fixture_id, team_id)
);

CREATE INDEX fixture_coaches_fixture_id_idx ON public.fixture_coaches (fixture_id);

ALTER TABLE public.fixture_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY fixture_coaches_public_read
  ON public.fixture_coaches
  FOR SELECT
  TO anon, authenticated
  USING (true);
