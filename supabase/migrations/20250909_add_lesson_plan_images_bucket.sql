-- Create public bucket for lesson plan images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('lesson-plan-images', 'lesson-plan-images', true)
on conflict (id) do nothing;

-- Policies for the bucket to allow client-side uploads in development
do $$ begin
  -- Public read
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for lesson-plan-images'
  ) then
    create policy "Public read for lesson-plan-images" on storage.objects
      for select to public
      using (bucket_id = 'lesson-plan-images');
  end if;

  -- Public insert
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public insert for lesson-plan-images'
  ) then
    create policy "Public insert for lesson-plan-images" on storage.objects
      for insert to public
      with check (bucket_id = 'lesson-plan-images');
  end if;

  -- Public update
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public update for lesson-plan-images'
  ) then
    create policy "Public update for lesson-plan-images" on storage.objects
      for update to public
      using (bucket_id = 'lesson-plan-images')
      with check (bucket_id = 'lesson-plan-images');
  end if;

  -- Public delete
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public delete for lesson-plan-images'
  ) then
    create policy "Public delete for lesson-plan-images" on storage.objects
      for delete to public
      using (bucket_id = 'lesson-plan-images');
  end if;
end $$;
