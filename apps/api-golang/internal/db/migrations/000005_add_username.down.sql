DROP INDEX IF EXISTS public.users_username_unique;

ALTER TABLE public.users
DROP COLUMN IF EXISTS username;