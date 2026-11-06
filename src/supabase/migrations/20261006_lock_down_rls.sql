-- ======================================================================================
-- MIGRATION: Restrict data access to signed-in users + revocable share tokens
-- ======================================================================================
-- Before: every table had "Allow public all access" (USING true) for the `public`
-- role, so anyone holding the anon key could read/modify/delete all data.
-- After: only authenticated Supabase users can access rows. Guests reach shared
-- projects exclusively through /api/share/[projectId] (service role + share_token).
-- Server routes use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
--
-- Run in the Supabase SQL editor. Safe to re-run.

-- 1. Share token for revocable read-only links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='share_token') THEN
    ALTER TABLE public.projects ADD COLUMN share_token text UNIQUE;
  END IF;
END $$;

-- 2. Enable RLS everywhere (test_data and users previously had none in this schema)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_module_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Replace the open policies with authenticated-only access
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'projects', 'project_tabs', 'functional_modules',
    'functional_module_templates', 'default_test_scenarios',
    'test_data', 'users'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow public all access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Authenticated full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- 4. Verify nothing else still grants anon access. Any rows returned here are
--    policies created outside this repo that should be reviewed/dropped:
-- SELECT tablename, policyname, roles, cmd FROM pg_policies
-- WHERE schemaname = 'public' AND policyname <> 'Authenticated full access';
