-- Aggregate recompute triggers (DATABASE.md §7; SCOPE.md career blend + tiers)

CREATE OR REPLACE FUNCTION public.tier_for_score(p_score numeric)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score >= 9 THEN 'elite'
    WHEN p_score >= 8 THEN 'world_class'
    WHEN p_score >= 7 THEN 'great'
    WHEN p_score >= 6 THEN 'good'
    WHEN p_score >= 5 THEN 'average'
    WHEN p_score >= 4 THEN 'below_average'
    WHEN p_score >= 3 THEN 'bad'
    ELSE 'unwatchable'
  END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_player_career_aggregate(p_player_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vote_count int;
  v_mean numeric(4, 2);
  v_fm_base numeric(4, 2);
  v_display numeric(4, 2);
  v_provisional boolean;
  v_tier text;
BEGIN
  SELECT count(*)::int, avg(value)::numeric(4, 2)
  INTO v_vote_count, v_mean
  FROM public.career_ratings
  WHERE player_id = p_player_id;

  SELECT COALESCE(fm_base_rating, 5.0)
  INTO v_fm_base
  FROM public.players
  WHERE id = p_player_id;

  IF v_vote_count < 10 THEN
    v_display := v_fm_base;
    v_provisional := true;
    v_tier := 'provisional';
  ELSE
    v_display := round((0.2 * v_mean + 0.8 * v_fm_base)::numeric, 2);
    v_provisional := false;
    v_tier := public.tier_for_score(v_display);
  END IF;

  INSERT INTO public.player_career_aggregates (
    player_id,
    vote_count,
    mean_user_rating,
    display_score,
    is_provisional,
    tier,
    updated_at
  )
  VALUES (
    p_player_id,
    v_vote_count,
    v_mean,
    v_display,
    v_provisional,
    v_tier,
    now()
  )
  ON CONFLICT (player_id) DO UPDATE
  SET
    vote_count = EXCLUDED.vote_count,
    mean_user_rating = EXCLUDED.mean_user_rating,
    display_score = EXCLUDED.display_score,
    is_provisional = EXCLUDED.is_provisional,
    tier = EXCLUDED.tier,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_player_match_aggregate(
  p_fixture_id bigint,
  p_player_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_avg numeric(4, 2);
BEGIN
  SELECT count(*)::int, avg(value)::numeric(4, 2)
  INTO v_count, v_avg
  FROM public.match_ratings
  WHERE fixture_id = p_fixture_id
    AND player_id = p_player_id;

  IF v_count = 0 THEN
    DELETE FROM public.player_match_aggregates
    WHERE fixture_id = p_fixture_id
      AND player_id = p_player_id;
    RETURN;
  END IF;

  INSERT INTO public.player_match_aggregates (
    fixture_id,
    player_id,
    rating_count,
    avg_rating,
    updated_at
  )
  VALUES (p_fixture_id, p_player_id, v_count, v_avg, now())
  ON CONFLICT (fixture_id, player_id) DO UPDATE
  SET
    rating_count = EXCLUDED.rating_count,
    avg_rating = EXCLUDED.avg_rating,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_player_form_snapshot(p_player_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixture_ids bigint[];
  v_avg numeric(4, 2);
BEGIN
  SELECT
    coalesce(array_agg(sub.fixture_id ORDER BY sub.kickoff_at DESC), '{}'),
    avg(sub.avg_rating)::numeric(4, 2)
  INTO v_fixture_ids, v_avg
  FROM (
    SELECT f.id AS fixture_id, f.kickoff_at, pma.avg_rating
    FROM public.fixture_appearances fa
    JOIN public.fixtures f ON f.id = fa.fixture_id
    JOIN public.player_match_aggregates pma
      ON pma.fixture_id = fa.fixture_id
      AND pma.player_id = fa.player_id
    WHERE fa.player_id = p_player_id
      AND fa.minutes_played > 0
      AND pma.avg_rating IS NOT NULL
    ORDER BY f.kickoff_at DESC
    LIMIT 5
  ) sub;

  INSERT INTO public.player_form_snapshots (player_id, last_5_avg, last_5_fixture_ids, updated_at)
  VALUES (p_player_id, v_avg, v_fixture_ids, now())
  ON CONFLICT (player_id) DO UPDATE
  SET
    last_5_avg = EXCLUDED.last_5_avg,
    last_5_fixture_ids = EXCLUDED.last_5_fixture_ids,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_player_tournament_aggregate(
  p_player_id bigint,
  p_season_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_avg numeric(4, 2);
BEGIN
  SELECT count(*)::int, avg(pma.avg_rating)::numeric(4, 2)
  INTO v_count, v_avg
  FROM public.player_match_aggregates pma
  JOIN public.fixtures f ON f.id = pma.fixture_id
  WHERE pma.player_id = p_player_id
    AND f.season_id = p_season_id
    AND pma.avg_rating IS NOT NULL;

  IF v_count = 0 THEN
    DELETE FROM public.player_tournament_aggregates
    WHERE player_id = p_player_id
      AND season_id = p_season_id;
    RETURN;
  END IF;

  INSERT INTO public.player_tournament_aggregates (
    player_id,
    season_id,
    avg_rating,
    appearances_rated,
    updated_at
  )
  VALUES (p_player_id, p_season_id, v_avg, v_count, now())
  ON CONFLICT (player_id, season_id) DO UPDATE
  SET
    avg_rating = EXCLUDED.avg_rating,
    appearances_rated = EXCLUDED.appearances_rated,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.on_career_rating_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player_id bigint;
BEGIN
  v_player_id := COALESCE(NEW.player_id, OLD.player_id);
  PERFORM public.recompute_player_career_aggregate(v_player_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER career_ratings_aggregate
  AFTER INSERT OR UPDATE OR DELETE ON public.career_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_career_rating_change();

CREATE OR REPLACE FUNCTION public.on_match_rating_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixture_id bigint;
  v_player_id bigint;
  v_season_id bigint;
BEGIN
  v_fixture_id := COALESCE(NEW.fixture_id, OLD.fixture_id);
  v_player_id := COALESCE(NEW.player_id, OLD.player_id);

  PERFORM public.recompute_player_match_aggregate(v_fixture_id, v_player_id);

  SELECT season_id INTO v_season_id FROM public.fixtures WHERE id = v_fixture_id;
  IF v_season_id IS NOT NULL THEN
    PERFORM public.recompute_player_tournament_aggregate(v_player_id, v_season_id);
  END IF;

  PERFORM public.recompute_player_form_snapshot(v_player_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER match_ratings_aggregate
  AFTER INSERT OR UPDATE OR DELETE ON public.match_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_match_rating_change();

-- Comment vote counters
CREATE OR REPLACE FUNCTION public.refresh_comment_vote_counts(p_comment_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_up int;
  v_down int;
BEGIN
  SELECT
    count(*) FILTER (WHERE value = 1),
    count(*) FILTER (WHERE value = -1)
  INTO v_up, v_down
  FROM public.comment_votes
  WHERE comment_id = p_comment_id;

  UPDATE public.comments
  SET
    upvote_count = v_up,
    downvote_count = v_down,
    score = v_up - v_down
  WHERE id = p_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_comment_vote_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_comment_vote_counts(COALESCE(NEW.comment_id, OLD.comment_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER comment_votes_refresh_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_comment_vote_change();
