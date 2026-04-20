ALTER TABLE public.users ADD COLUMN username text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (lower(username));