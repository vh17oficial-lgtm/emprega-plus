-- ============================================================
-- Emprega+ : MisticPay Payments Table
-- Execute this in your Supabase SQL Editor
-- ============================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_type TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  granted_value INTEGER DEFAULT 0,
  transaction_id TEXT UNIQUE NOT NULL,
  mistic_transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  qr_code_base64 TEXT,
  qr_code_url TEXT,
  payer_name TEXT,
  payer_document TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments
DROP POLICY IF EXISTS "Users can read own payments" ON payments;
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role manages all (insert/update from API routes)
-- Note: service_role bypasses RLS by default, but explicit policy for clarity
DROP POLICY IF EXISTS "Service role full access" ON payments;
CREATE POLICY "Service role full access"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Fulfillment function (called by webhook/check-payment)
-- Idempotent: only fulfills if status is 'pending'
-- ============================================================
CREATE OR REPLACE FUNCTION fulfill_payment(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_result JSONB;
BEGIN
  -- Lock the row to prevent double fulfillment
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'already_fulfilled', true);
  END IF;

  IF v_payment.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not in pending state');
  END IF;

  -- Fulfill based on product_type
  CASE v_payment.product_type
    WHEN 'send_credits' THEN
      UPDATE profiles SET
        send_credits = COALESCE(send_credits, 0) + v_payment.granted_value,
        purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
          'type', 'send_credits',
          'plan', v_payment.product_name,
          'price', v_payment.amount,
          'credits', v_payment.granted_value,
          'date', now()
        )
      WHERE id = v_payment.user_id;

    WHEN 'auto_dispatch' THEN
      UPDATE profiles SET
        auto_dispatch_access = true,
        daily_dispatch_limit = v_payment.granted_value,
        daily_dispatch_used = 0,
        purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
          'type', 'auto_dispatch',
          'plan', v_payment.product_name,
          'price', v_payment.amount,
          'date', now()
        )
      WHERE id = v_payment.user_id;

    WHEN 'daily_limit_upgrade' THEN
      UPDATE profiles SET
        daily_dispatch_limit = CASE
          WHEN v_payment.granted_value = -1 THEN 999999
          ELSE COALESCE(daily_dispatch_limit, 0) + v_payment.granted_value
        END,
        daily_dispatch_unlimited = CASE
          WHEN v_payment.granted_value = -1 THEN true
          ELSE daily_dispatch_unlimited
        END,
        purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
          'type', 'daily_limit_upgrade',
          'plan', v_payment.product_name,
          'price', v_payment.amount,
          'date', now()
        )
      WHERE id = v_payment.user_id;

    WHEN 'priority' THEN
      UPDATE profiles SET
        is_priority_user = true,
        purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
          'type', 'priority',
          'plan', v_payment.product_name,
          'price', v_payment.amount,
          'date', now()
        )
      WHERE id = v_payment.user_id;

    WHEN 'pdf_unlock' THEN
      UPDATE profiles SET
        pdf_download_access = true,
        purchase_history = COALESCE(purchase_history, '[]'::jsonb) || jsonb_build_object(
          'type', 'pdf_unlock',
          'plan', v_payment.product_name,
          'price', v_payment.amount,
          'date', now()
        )
      WHERE id = v_payment.user_id;

    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Unknown product type: ' || v_payment.product_type);
  END CASE;

  -- Mark payment as completed
  UPDATE payments SET
    status = 'completed',
    completed_at = now()
  WHERE id = p_payment_id;

  RETURN jsonb_build_object('success', true, 'product_type', v_payment.product_type);
END;
$$;
