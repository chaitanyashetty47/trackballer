-- One lineup per tournament stage; admin picks which published stage is live on home / World Cup.
ALTER TABLE public.team_of_the_week
  ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS team_of_the_week_season_round_uidx
  ON public.team_of_the_week (season_id, round_id)
  WHERE round_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS team_of_the_week_featured_idx
  ON public.team_of_the_week (season_id, featured_at DESC NULLS LAST)
  WHERE featured_at IS NOT NULL;
