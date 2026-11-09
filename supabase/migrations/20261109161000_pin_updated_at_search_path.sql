-- Pin the trigger function's search_path to prevent object-shadowing attacks.
alter function public.set_updated_at() set search_path = pg_catalog, public;
