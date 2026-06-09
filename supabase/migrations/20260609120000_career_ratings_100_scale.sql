-- Career ratings: 1–10 (0.5 steps) → 1–100 integers (FIFA-style OVR).
-- Blend formula unchanged: 0.2 × mean(user votes) + 0.8 × FM base.

CREATE OR REPLACE FUNCTION public.career_rating_integer_check(p_value numeric)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_value >= 1
    AND p_value <= 100
    AND p_value = floor(p_value);
$$;

-- Drop old 1–10 constraint before scaling values to 1–100.
ALTER TABLE public.career_ratings
  DROP CONSTRAINT IF EXISTS career_ratings_value_half_step;

-- Widen columns and scale 1–10 → 1–100 in one step (NUMERIC(4,2) cannot hold 100).
ALTER TABLE public.career_ratings
  ALTER COLUMN value TYPE numeric(5, 0)
  USING round(value * 10);

ALTER TABLE public.players
  ALTER COLUMN fm_base_rating TYPE numeric(5, 0)
  USING CASE
    WHEN fm_base_rating IS NULL THEN NULL
    WHEN fm_base_rating <= 10 THEN round(fm_base_rating * 10)
    ELSE round(fm_base_rating)
  END;

ALTER TABLE public.player_career_aggregates
  ALTER COLUMN mean_user_rating TYPE numeric(5, 0)
  USING CASE
    WHEN mean_user_rating IS NULL THEN NULL
    WHEN mean_user_rating <= 10 THEN round(mean_user_rating * 10)
    ELSE round(mean_user_rating)
  END;

ALTER TABLE public.player_career_aggregates
  ALTER COLUMN display_score TYPE numeric(5, 0)
  USING CASE
    WHEN display_score <= 10 THEN round(display_score * 10)
    ELSE round(display_score)
  END;

ALTER TABLE public.career_ratings
  ADD CONSTRAINT career_ratings_value_integer_check
  CHECK (public.career_rating_integer_check (value));

CREATE OR REPLACE FUNCTION public.tier_for_score(p_score numeric)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score >= 90 THEN 'elite'
    WHEN p_score >= 80 THEN 'world_class'
    WHEN p_score >= 70 THEN 'great'
    WHEN p_score >= 60 THEN 'good'
    WHEN p_score >= 50 THEN 'average'
    WHEN p_score >= 40 THEN 'below_average'
    WHEN p_score >= 30 THEN 'bad'
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
  v_mean numeric(5, 0);
  v_fm_base numeric(5, 0);
  v_display numeric(5, 0);
  v_provisional boolean;
  v_tier text;
BEGIN
  SELECT count(*)::int, round(avg(value))::numeric(5, 0)
  INTO v_vote_count, v_mean
  FROM public.career_ratings
  WHERE player_id = p_player_id;

  SELECT round(COALESCE(fm_base_rating, 50))::numeric(5, 0)
  INTO v_fm_base
  FROM public.players
  WHERE id = p_player_id;

  IF v_vote_count < 10 THEN
    v_display := v_fm_base;
    v_provisional := true;
    v_tier := 'provisional';
  ELSE
    v_display := round(0.2 * v_mean + 0.8 * v_fm_base)::numeric(5, 0);
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
    round(COALESCE(NEW.fm_base_rating, 50)),
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

-- Recompute every aggregate on the new scale.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.players
  LOOP
    PERFORM public.recompute_player_career_aggregate(r.id);
  END LOOP;
END;
$$;
