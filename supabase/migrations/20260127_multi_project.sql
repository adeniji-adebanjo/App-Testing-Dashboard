-- Migration: Multi-project Support Updates (idempotent)
-- Date: 2026-01-27 (updated)

-- 0. Ensure uuid-ossp extension exists for uuid_generate_v4 (optional, if you use uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create projects table for better relational management
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  short_code text NOT NULL,
  description text,
  tech_stack text[] DEFAULT '{}',
  project_type text DEFAULT 'web',
  target_users text[] DEFAULT '{}',
  document_version text DEFAULT '1.0',
  status text NOT NULL DEFAULT 'active',
  phase text NOT NULL DEFAULT 'planning',
  color text DEFAULT '#6366F1',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, short_code)
);

-- 1.1 Ensure project_type column exists (for cases where table already existed without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'project_type'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN project_type text DEFAULT 'web';
  END IF;
END;
$$;

-- 2. Add project_id column to test_data for better indexing and isolation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'test_data'
      AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.test_data
      ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- 3. Create an index on project_id for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index i ON i.indrelid = t.oid
    JOIN pg_class ix ON ix.oid = i.indexrelid
    WHERE n.nspname = 'public'
      AND t.relname = 'test_data'
      AND ix.relname = 'idx_test_data_project_id'
  ) THEN
    CREATE INDEX idx_test_data_project_id ON public.test_data(project_id);
  END IF;
END;
$$;

-- 4. Update RLS policies for projects (idempotent)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename  = 'projects'
      AND p.policyname = 'Allow public all access to projects'
  ) THEN
    CREATE POLICY "Allow public all access to projects"
      ON public.projects
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

-- 5. Helper function to handle updated_at
-- Replace the function if it exists to ensure expected behavior (idempotent replace)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  -- set UTC timestamp; change to now() if you prefer server local time
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Revoke execute from public roles if needed (optional, uncomment if desired)
-- REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC;

-- 6. Add triggers for updated_at (idempotent)
-- projects trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'projects'
      AND trigger_name = 'set_projects_updated_at'
  ) THEN
    CREATE TRIGGER set_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;

-- test_data trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'test_data'
      AND trigger_name = 'set_test_data_updated_at'
  ) THEN
    CREATE TRIGGER set_test_data_updated_at
      BEFORE UPDATE ON public.test_data
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END;
$$;

-- 7. Final note: Ensure related tables exist
-- Ensure public.users and public.test_data exist before running dependency steps.
-- You can uncomment and run the following checks if you want to fail early with a descriptive message.

-- SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users';
-- SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='test_data';