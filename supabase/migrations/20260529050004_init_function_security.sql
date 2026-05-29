-- Harden SECURITY DEFINER functions: fixed search_path + revoke public RPC execute

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.rating_half_step_check(numeric) SET search_path = public;
ALTER FUNCTION public.tier_for_score(numeric) SET search_path = public;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.init_player_career_aggregate() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.on_career_rating_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.on_match_rating_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.on_comment_vote_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_player_career_aggregate(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_player_match_aggregate(bigint, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_player_form_snapshot(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_player_tournament_aggregate(bigint, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_comment_vote_counts(bigint) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
