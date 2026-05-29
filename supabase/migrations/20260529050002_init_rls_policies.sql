-- Row Level Security (DATABASE.md §11)
-- Uses (select auth.uid()) for per-query caching (Supabase RLS performance best practice)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Catalog: public read; writes via service role only
DO $$
DECLARE
  catalog_table text;
BEGIN
  FOREACH catalog_table IN ARRAY ARRAY[
    'leagues',
    'seasons',
    'rounds',
    'teams',
    'players',
    'player_season_squads',
    'fixtures',
    'fixture_lineups',
    'fixture_appearances',
    'fixture_events'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', catalog_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      catalog_table || '_public_read',
      catalog_table
    );
  END LOOP;
END;
$$;

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_public_read ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Profile junction tables
ALTER TABLE public.profile_followed_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interested_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_followed_clubs_public_read ON public.profile_followed_clubs
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY profile_followed_clubs_manage_own ON public.profile_followed_clubs
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY profile_interested_leagues_public_read ON public.profile_interested_leagues
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY profile_interested_leagues_manage_own ON public.profile_interested_leagues
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Ratings
ALTER TABLE public.career_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY career_ratings_public_read ON public.career_ratings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY career_ratings_insert_own ON public.career_ratings
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY career_ratings_update_own ON public.career_ratings
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY career_ratings_delete_own ON public.career_ratings
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY match_ratings_public_read ON public.match_ratings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY match_ratings_insert_own ON public.match_ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1
      FROM public.fixtures f
      WHERE f.id = fixture_id
        AND f.ratings_unlocked_at IS NOT NULL
    )
    AND EXISTS (
      SELECT 1
      FROM public.fixture_appearances fa
      WHERE fa.fixture_id = match_ratings.fixture_id
        AND fa.player_id = match_ratings.player_id
        AND fa.is_rateable = true
    )
  );

CREATE POLICY match_ratings_update_own ON public.match_ratings
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY match_ratings_delete_own ON public.match_ratings
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Aggregate caches: public read only
ALTER TABLE public.player_career_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_form_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_tournament_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY player_career_aggregates_public_read ON public.player_career_aggregates
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY player_match_aggregates_public_read ON public.player_match_aggregates
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY player_form_snapshots_public_read ON public.player_form_snapshots
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY player_tournament_aggregates_public_read ON public.player_tournament_aggregates
  FOR SELECT TO anon, authenticated USING (true);

-- Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_public_read ON public.comments
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false OR (SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

CREATE POLICY comments_insert_auth ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (SELECT is_banned FROM public.profiles WHERE id = (SELECT auth.uid())) = false
  );

CREATE POLICY comments_update_own ON public.comments
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

CREATE POLICY comments_delete_own_or_admin ON public.comments
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

CREATE POLICY comment_votes_public_read ON public.comment_votes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY comment_votes_manage_own ON public.comment_votes
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admin editorial
ALTER TABLE public.featured_trending_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_of_the_week ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_of_the_week_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY featured_trending_public_read ON public.featured_trending_players
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY featured_trending_admin_write ON public.featured_trending_players
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY team_of_the_week_public_read ON public.team_of_the_week
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY team_of_the_week_admin_write ON public.team_of_the_week
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY team_of_the_week_players_public_read ON public.team_of_the_week_players
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY team_of_the_week_players_admin_write ON public.team_of_the_week_players
  FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));
