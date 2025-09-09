-- Add a text app_id column to map application IDs to DB rows
alter table if exists lesson_plans
  add column if not exists app_id text;

-- Ensure app_id is unique when present
create unique index if not exists idx_lesson_plans_app_id on lesson_plans(app_id);

