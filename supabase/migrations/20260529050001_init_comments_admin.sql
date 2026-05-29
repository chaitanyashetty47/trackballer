-- Comments, votes, admin editorial tables

CREATE TABLE public.comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  player_id BIGINT REFERENCES public.players (id) ON DELETE CASCADE,
  fixture_id BIGINT REFERENCES public.fixtures (id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES public.comments (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  upvote_count INT NOT NULL DEFAULT 0,
  downvote_count INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_target_type_check CHECK (target_type IN ('player', 'match')),
  CONSTRAINT comments_target_fk_check CHECK (
    (
      target_type = 'player'
      AND player_id IS NOT NULL
      AND fixture_id IS NULL
    )
    OR (
      target_type = 'match'
      AND fixture_id IS NOT NULL
      AND player_id IS NULL
    )
  ),
  CONSTRAINT comments_body_length CHECK (char_length(body) <= 280)
);

CREATE INDEX comments_player_created_idx ON public.comments (player_id, created_at DESC)
  WHERE player_id IS NOT NULL AND is_deleted = false;

CREATE INDEX comments_fixture_created_idx ON public.comments (fixture_id, created_at DESC)
  WHERE fixture_id IS NOT NULL AND is_deleted = false;

CREATE INDEX comments_parent_id_idx ON public.comments (parent_id);

CREATE INDEX comments_score_idx ON public.comments (score DESC)
  WHERE is_deleted = false AND parent_id IS NULL;

CREATE INDEX comments_user_id_idx ON public.comments (user_id);

CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.comment_votes (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  comment_id BIGINT NOT NULL REFERENCES public.comments (id) ON DELETE CASCADE,
  value SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id),
  CONSTRAINT comment_votes_value_check CHECK (value IN (-1, 1))
);

CREATE INDEX comment_votes_comment_id_idx ON public.comment_votes (comment_id);

CREATE TABLE public.featured_trending_players (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  pinned_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX featured_trending_players_sort_idx ON public.featured_trending_players (sort_order);

CREATE TABLE public.team_of_the_week (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id BIGINT NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  round_id BIGINT REFERENCES public.rounds (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  formation TEXT NOT NULL DEFAULT '4-3-3',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_of_the_week_players (
  team_of_the_week_id BIGINT NOT NULL REFERENCES public.team_of_the_week (id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players (id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (team_of_the_week_id, slot)
);

CREATE INDEX team_of_the_week_players_player_id_idx
  ON public.team_of_the_week_players (player_id);

-- Inactive top-five league stubs (Slice 16)
INSERT INTO public.leagues (id, name, slug, country, is_active)
VALUES
  (39, 'Premier League', 'premier-league', 'England', false),
  (140, 'La Liga', 'la-liga', 'Spain', false),
  (78, 'Bundesliga', 'bundesliga', 'Germany', false),
  (135, 'Serie A', 'serie-a', 'Italy', false),
  (61, 'Ligue 1', 'ligue-1', 'France', false)
ON CONFLICT (id) DO NOTHING;
