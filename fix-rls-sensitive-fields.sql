-- =============================================
-- FIX: Protect sensitive profile fields from client-side tampering
-- Execute no SQL Editor do Supabase Dashboard
--
-- WHAT THIS DOES:
-- 1. Adds a trigger that prevents regular users from modifying
--    sensitive columns (role, credits, purchases, etc.) via direct UPDATE
-- 2. Creates SECURITY DEFINER RPC functions for legitimate operations
--    (consume credits, purchases, etc.) that bypass the trigger safely
-- 3. Restricts RPC execution to authenticated users only
-- =============================================

-- =============================================
-- 1. TRIGGER: Block direct sensitive field changes
-- =============================================
-- Regular users can only change: nome, telefone, cidade, estado, foto_perfil_url
-- Admins and SECURITY DEFINER RPCs can change anything

CREATE OR REPLACE FUNCTION protect_sensitive_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- SECURITY DEFINER RPCs execute as 'postgres' — allow them through
  IF current_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Admins can change everything
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Regular users: revert ALL sensitive fields to their original values
  -- (safe fields like nome, telefone, cidade, estado, foto_perfil_url pass through)
  NEW.role := OLD.role;
  NEW.email := OLD.email;
  NEW.send_credits := OLD.send_credits;
  NEW.auto_dispatch_access := OLD.auto_dispatch_access;
  NEW.daily_dispatch_limit := OLD.daily_dispatch_limit;
  NEW.daily_dispatch_used := OLD.daily_dispatch_used;
  NEW.daily_dispatch_unlimited := OLD.daily_dispatch_unlimited;
  NEW.is_priority_user := OLD.is_priority_user;
  NEW.pdf_download_access := OLD.pdf_download_access;
  NEW.purchase_history := OLD.purchase_history;
  NEW.last_dispatch_date := OLD.last_dispatch_date;
  NEW.created_at := OLD.created_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_profile_sensitive_fields ON public.profiles;

CREATE TRIGGER protect_profile_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_sensitive_profile_fields();

-- =============================================
-- 2. RPC: Consume 1 send credit (atomic)
-- =============================================
CREATE OR REPLACE FUNCTION consume_send_credit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE profiles
  SET send_credits = send_credits - 1
  WHERE id = auth.uid() AND send_credits > 0;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- =============================================
-- 3. RPC: Add send credits + record purchase
-- =============================================
CREATE OR REPLACE FUNCTION add_send_credits(
  p_amount integer,
  p_plan_name text,
  p_plan_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    send_credits = send_credits + p_amount,
    purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
      'type', 'send_credits',
      'name', p_plan_name,
      'amount', p_amount,
      'price', p_plan_price,
      'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
    )
  WHERE id = auth.uid();
END;
$$;

-- =============================================
-- 4. RPC: Purchase auto dispatch
-- =============================================
CREATE OR REPLACE FUNCTION purchase_auto_dispatch(
  p_daily_limit integer,
  p_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    auto_dispatch_access = true,
    daily_dispatch_limit = p_daily_limit,
    daily_dispatch_used = 0,
    last_dispatch_date = current_date::text,
    purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
      'type', 'auto_dispatch',
      'name', 'Disparador Automático',
      'price', p_price,
      'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
    )
  WHERE id = auth.uid();
END;
$$;

-- =============================================
-- 5. RPC: Upgrade daily dispatch limit
-- =============================================
CREATE OR REPLACE FUNCTION upgrade_daily_limit(
  p_amount integer,
  p_label text,
  p_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount = -1 THEN
    -- Unlimited
    UPDATE profiles
    SET
      daily_dispatch_unlimited = true,
      purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
        'type', 'dispatch_upgrade',
        'name', p_label,
        'price', p_price,
        'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
      )
    WHERE id = auth.uid();
  ELSE
    UPDATE profiles
    SET
      daily_dispatch_limit = daily_dispatch_limit + p_amount,
      purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
        'type', 'dispatch_upgrade',
        'name', p_label,
        'price', p_price,
        'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
      )
    WHERE id = auth.uid();
  END IF;
END;
$$;

-- =============================================
-- 6. RPC: Consume daily dispatch (atomic, returns actual consumed)
-- =============================================
CREATE OR REPLACE FUNCTION consume_daily_dispatch(p_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof profiles%ROWTYPE;
  remaining integer;
  actual integer;
  today text := current_date::text;
BEGIN
  SELECT * INTO prof FROM profiles WHERE id = auth.uid();

  IF prof IS NULL OR NOT prof.auto_dispatch_access THEN
    RETURN 0;
  END IF;

  -- Unlimited users
  IF prof.daily_dispatch_unlimited THEN
    UPDATE profiles
    SET daily_dispatch_used = CASE
          WHEN last_dispatch_date = today THEN daily_dispatch_used + p_count
          ELSE p_count
        END,
        last_dispatch_date = today
    WHERE id = auth.uid();
    RETURN p_count;
  END IF;

  -- Calculate remaining quota (reset if new day)
  IF prof.last_dispatch_date IS NULL OR prof.last_dispatch_date != today THEN
    remaining := prof.daily_dispatch_limit;
  ELSE
    remaining := GREATEST(0, prof.daily_dispatch_limit - prof.daily_dispatch_used);
  END IF;

  actual := LEAST(p_count, remaining);
  IF actual <= 0 THEN
    RETURN 0;
  END IF;

  UPDATE profiles
  SET daily_dispatch_used = CASE
        WHEN last_dispatch_date = today THEN daily_dispatch_used + actual
        ELSE actual
      END,
      last_dispatch_date = today
  WHERE id = auth.uid();

  RETURN actual;
END;
$$;

-- =============================================
-- 7. RPC: Purchase priority resume
-- =============================================
CREATE OR REPLACE FUNCTION purchase_priority()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    is_priority_user = true,
    purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
      'type', 'priority_resume',
      'name', 'Currículo com Prioridade',
      'price', 9.99,
      'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
    )
  WHERE id = auth.uid();
END;
$$;

-- =============================================
-- 8. RPC: Purchase PDF access
-- =============================================
CREATE OR REPLACE FUNCTION purchase_pdf_access(p_price numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    pdf_download_access = true,
    purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
      'type', 'pdf_download',
      'name', 'Download de Currículo em PDF',
      'price', p_price,
      'date', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY, HH24:MI:SS')
    )
  WHERE id = auth.uid();
END;
$$;

-- =============================================
-- 9. RPC: Reset daily dispatch if day changed (login)
-- Uses DB time instead of client time
-- =============================================
CREATE OR REPLACE FUNCTION reset_daily_dispatch_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today text := current_date::text;
BEGIN
  UPDATE profiles
  SET daily_dispatch_used = 0, last_dispatch_date = today
  WHERE id = auth.uid()
    AND auto_dispatch_access = true
    AND (last_dispatch_date IS NULL OR last_dispatch_date != today);
END;
$$;

-- =============================================
-- 10. PERMISSIONS: Only authenticated users can call RPCs
-- =============================================
REVOKE ALL ON FUNCTION consume_send_credit() FROM public, anon;
GRANT EXECUTE ON FUNCTION consume_send_credit() TO authenticated;

REVOKE ALL ON FUNCTION add_send_credits(integer, text, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION add_send_credits(integer, text, numeric) TO authenticated;

REVOKE ALL ON FUNCTION purchase_auto_dispatch(integer, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION purchase_auto_dispatch(integer, numeric) TO authenticated;

REVOKE ALL ON FUNCTION upgrade_daily_limit(integer, text, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION upgrade_daily_limit(integer, text, numeric) TO authenticated;

REVOKE ALL ON FUNCTION consume_daily_dispatch(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION consume_daily_dispatch(integer) TO authenticated;

REVOKE ALL ON FUNCTION purchase_priority() FROM public, anon;
GRANT EXECUTE ON FUNCTION purchase_priority() TO authenticated;

REVOKE ALL ON FUNCTION purchase_pdf_access(numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION purchase_pdf_access(numeric) TO authenticated;

REVOKE ALL ON FUNCTION reset_daily_dispatch_if_needed() FROM public, anon;
GRANT EXECUTE ON FUNCTION reset_daily_dispatch_if_needed() TO authenticated;
