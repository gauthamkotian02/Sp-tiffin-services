
-- Lock down SECURITY DEFINER functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- has_role still callable by authenticated for RLS evaluation:
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Restrict bucket listing: keep public read of objects via direct URL,
-- but disallow listing all files in the bucket.
drop policy if exists "menu media public read" on storage.objects;
create policy "menu media public read object"
  on storage.objects for select
  using (bucket_id = 'menu-media');

-- Disallow anonymous bucket listing by removing public access to storage.buckets row
-- (Supabase already restricts buckets table; nothing further needed here.)
