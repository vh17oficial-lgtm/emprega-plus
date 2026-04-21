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
BEGIN
  -- Count admins (sanity check)
  SELECT COUNT(*) INTO v_admins
  FROM public.profiles
  WHERE role = 'admin';

  IF v_admins = 0 THEN
    RAISE EXCEPTION 'ABORT: no admin profiles found. Refusing to delete everyone.';
  END IF;

  -- Delete auth users whose profile is not admin (or who have no profile)
  WITH victims AS (
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.role IS DISTINCT FROM 'admin'
  )
  DELETE FROM auth.users
  WHERE id IN (SELECT id FROM victims);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Safety: explicitly remove any orphan profiles that weren't cascaded
  DELETE FROM public.profiles
  WHERE role IS DISTINCT FROM 'admin'
    AND id NOT IN (SELECT id FROM auth.users);

  RAISE NOTICE 'Kept % admin(s). Deleted % non-admin user(s).', v_admins, v_deleted;
END $$;

-- Optional: also clean up leftover rows in tables that may not have CASCADE.
-- Safe because admin-owned rows are preserved.
DO $$
DECLARE
  v_tbl text;
  v_admin_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO v_admin_ids FROM public.profiles WHERE role = 'admin';

  FOREACH v_tbl IN ARRAY ARRAY[
    'applications','saved_resumes','payments','support_conversations',
    'support_messages','support_tickets','tickets','ticket_messages'
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
END $$;
