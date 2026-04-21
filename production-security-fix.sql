-- ============================================================
-- PRODUCTION SECURITY & SCHEMA FIX
-- Run this AFTER all other migrations in supabase SQL editor.
-- Idempotent - safe to run multiple times.
-- ============================================================

-- 1) Missing column used by jobGenerator/jobToRow
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS escolaridade text;

-- 2) CRITICAL: revoke the legacy "purchase_*" RPCs from authenticated role.
--    These SECURITY DEFINER functions grant paid features without going
--    through the payment webhook -> any logged-in user could call them
--    from the browser console and bypass billing.
--    The real payment flow uses fulfill_payment() (service_role only),
--    so these are dead code. Keep the functions (for admin/manual use
--    via service_role) but remove public EXECUTE.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'add_send_credits(integer,text,numeric)',
    'purchase_auto_dispatch(integer,numeric)',
    'upgrade_daily_limit(integer,text,numeric)',
    'purchase_priority()',
    'purchase_pdf_access(numeric)'
  ] LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated, anon', fn);
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
  END LOOP;
END $$;

-- 3) Consume RPCs stay callable by users (debit-only, safe).
--    Wrapped so missing functions don't abort the migration.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'consume_send_credit()',
    'consume_daily_dispatch()',
    'reset_daily_dispatch_if_needed()'
  ] LOOP
    BEGIN
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXCEPTION WHEN undefined_function THEN NULL;
    END;
  END LOOP;
END $$;

-- 4) Performance indexes (no-op if already present)
CREATE INDEX IF NOT EXISTS idx_applications_user_id   ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id    ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_created    ON public.jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role          ON public.profiles(role);

-- 5) Ask PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
