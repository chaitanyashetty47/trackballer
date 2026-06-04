-- Mirror profiles.is_admin and onboarding completion into JWT app_metadata on each token issue/refresh.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  profile_is_admin boolean := false;
  profile_is_onboarded boolean := false;
  user_uuid uuid;
BEGIN
  user_uuid := (event->>'user_id')::uuid;

  SELECT
    COALESCE(p.is_admin, false),
    (p.onboarding_completed_at IS NOT NULL)
  INTO profile_is_admin, profile_is_onboarded
  FROM public.profiles p
  WHERE p.id = user_uuid;

  claims := event->'claims';

  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  claims := jsonb_set(claims, '{app_metadata,is_admin}', to_jsonb(profile_is_admin));
  claims := jsonb_set(claims, '{app_metadata,is_onboarded}', to_jsonb(profile_is_onboarded));

  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
