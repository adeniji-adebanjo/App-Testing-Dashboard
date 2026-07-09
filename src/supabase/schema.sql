-- ======================================================================================
-- MASTER MIGRATION: Multi-project + Functional/Non-Functional Testing System
-- ======================================================================================

-- 0. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unified function for auto-updating "updated_at" timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  short_code text NOT NULL,
  description text,
  tech_stack text[] DEFAULT '{}',
  project_type text DEFAULT 'web', -- 'web' or 'mobile'
  target_users text[] DEFAULT '{}',
  document_version text DEFAULT '1.0',
  status text NOT NULL DEFAULT 'active',
  phase text NOT NULL DEFAULT 'planning',
  color text DEFAULT '#6366F1',
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, short_code)
);

-- Ensure columns exist if table was already created earlier
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='project_type') THEN
    ALTER TABLE public.projects ADD COLUMN project_type text DEFAULT 'web';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='icon') THEN
    ALTER TABLE public.projects ADD COLUMN icon text;
  END IF;
END $$;

-- 2. PROJECT TABS
CREATE TABLE IF NOT EXISTS public.project_tabs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  "order" integer DEFAULT 0,
  is_default boolean DEFAULT false,
  ai_generated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TESTING MODULES (Functional & Non-Functional)
CREATE TABLE IF NOT EXISTS public.functional_modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  module_type text NOT NULL DEFAULT 'functional', -- 'functional' or 'non-functional'
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  "order" integer DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (project_id, module_type, slug)
);

-- 4. MODULE TEMPLATES & DEFAULT SCENARIOS
CREATE TABLE IF NOT EXISTS public.functional_module_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id uuid REFERENCES public.functional_modules(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  test_case_id_prefix text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.default_test_scenarios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES public.functional_module_templates(id) ON DELETE CASCADE NOT NULL,
  test_case_id text NOT NULL,
  scenario text NOT NULL,
  expected_result text NOT NULL,
  steps text,
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RELink EXISTING TEST_DATA
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_data' AND column_name='project_id') THEN
    ALTER TABLE public.test_data ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. INDEXES FOR PERFORMANCE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_project_tabs_project_id') THEN
    CREATE INDEX idx_project_tabs_project_id ON public.project_tabs(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_test_data_project_id') THEN
    CREATE INDEX idx_test_data_project_id ON public.test_data(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_functional_modules_project_id') THEN
    CREATE INDEX idx_functional_modules_project_id ON public.functional_modules(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_functional_module_templates_project_id') THEN
    CREATE INDEX idx_functional_module_templates_project_id ON public.functional_module_templates(project_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_default_test_scenarios_template_id') THEN
    CREATE INDEX idx_default_test_scenarios_template_id ON public.default_test_scenarios(template_id);
  END IF;
END $$;

-- 7. RLS POLICIES (Security)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_module_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.default_test_scenarios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Shared policy for all public tables in this app
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow public all access') THEN
    CREATE POLICY "Allow public all access" ON public.projects FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_tabs' AND policyname = 'Allow public all access') THEN
    CREATE POLICY "Allow public all access" ON public.project_tabs FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'functional_modules' AND policyname = 'Allow public all access') THEN
    CREATE POLICY "Allow public all access" ON public.functional_modules FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'functional_module_templates' AND policyname = 'Allow public all access') THEN
    CREATE POLICY "Allow public all access" ON public.functional_module_templates FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'default_test_scenarios' AND policyname = 'Allow public all access') THEN
    CREATE POLICY "Allow public all access" ON public.default_test_scenarios FOR ALL TO public USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 8. AUTO-UPDATE TRIGGERS
-- Re-run to ensure all tables benefit from updated_at tracking
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['projects', 'project_tabs', 'test_data', 'functional_modules', 'functional_module_templates', 'default_test_scenarios']) LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = t AND trigger_name = 'set_' || t || '_updated_at') THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', 'set_' || t || '_updated_at', t);
        END IF;
    END LOOP;
END $$;