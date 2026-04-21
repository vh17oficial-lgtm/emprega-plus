-- ============================================================
-- RESET ALL NON-ADMIN USERS
-- Deletes every auth.users entry whose profile is NOT role='admin'.
-- Cascades to profiles and every related table via existing FKs.
-- Idempotent - safe to run multiple times.
-- ============================================================

DO $$
DECLARE
  v_deleted INT := 0;
  v_admins  INT := 0;
  v_admin_ids uuid[];
  v_tbl text;
BEGIN
  -- Count admins (sanity check)
  SELECT COUNT(*) INTO v_admins
  FROM public.profiles
  WHERE role = 'admin';

  IF v_admins = 0 THEN
    RAISE EXCEPTION 'ABORT: no admin profiles found. Refusing to delete everyone.';
  END IF;

  SELECT array_agg(id) INTO v_admin_ids FROM public.profiles WHERE role = 'admin';

  -- STEP 1: Delete rows from every table that references users, for non-admins.
  -- Tables with a user_id column:
  FOREACH v_tbl IN ARRAY ARRAY[
    'payments','applications','saved_resumes','support_conversations',
    'support_messages','support_tickets','tickets','ticket_messages',
    'user_coupons','user_job_views','user_saved_jobs','user_notifications',
    'social_proof_events','audit_log'
  ] LOOP
    BEGIN
      EXECUTE format(
        'DELETE FROM public.%I WHERE user_id IS NOT NULL AND user_id <> ALL($1)',
        v_tbl
      ) USING v_admin_ids;
    EXCEPTION
      WHEN undefined_table THEN NULL;
      WHEN undefined_column THEN NULL;
    END;
  END LOOP;

  -- STEP 2: Delete non-admin profiles (FK profiles.id -> auth.users.id)
  DELETE FROM public.profiles
  WHERE role IS DISTINCT FROM 'admin';

  -- STEP 3: Now safe to delete from auth.users
  DELETE FROM auth.users
  WHERE id <> ALL(v_admin_ids);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RAISE NOTICE 'Kept % admin(s). Deleted % non-admin auth user(s).', v_admins, v_deleted;
END $$;
