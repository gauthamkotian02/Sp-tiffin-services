-- Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "profiles viewable by authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Hide feedback.email column from anonymous/public reads
REVOKE SELECT (email) ON public.feedback FROM anon;
REVOKE SELECT (email) ON public.feedback FROM PUBLIC;
GRANT SELECT (email) ON public.feedback TO authenticated;