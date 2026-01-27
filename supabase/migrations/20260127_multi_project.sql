-- Migration: Multi-project Support Updates
-- Date: 2026-01-27

-- 1. Create projects table for better relational management
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  short_code text not null,
  description text,
  tech_stack text[] default '{}',
  target_users text[] default '{}',
  document_version text default '1.0',
  status text not null default 'active',
  phase text not null default 'planning',
  color text default '#6366F1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, short_code)
);

-- 2. Add project_id column to test_data for better indexing and isolation
alter table test_data add column if not exists project_id uuid references projects(id) on delete cascade;

-- 3. Create an index on project_id for faster lookups
create index if not exists idx_test_data_project_id on test_data(project_id);

-- 4. Update RLS policies for projects
alter table projects enable row level security;

create policy "Allow public all access to projects"
  on projects for all
  using (true)
  with check (true);

-- 5. Helper function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 6. Add triggers for updated_at
drop trigger if exists set_projects_updated_at on projects;
create trigger set_projects_updated_at
  before update on projects
  for each row
  execute function handle_updated_at();

drop trigger if exists set_test_data_updated_at on test_data;
create trigger set_test_data_updated_at
  before update on test_data
  for each row
  execute function handle_updated_at();

-- Note: The application will still use test_data for the JSON blobs, 
-- but now we have a way to associate them with a project_id column 
-- which allows for better database-level filtering and future migrations.
