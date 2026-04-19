import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const misticClientSecret = process.env.MISTICPAY_CLIENT_SECRET;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const transactionId = body.transactionId || body.transaction_id;
    const state = body.transactionState || body.state || body.status;

    if (!transactionId) {
      console.error('Webhook: no transactionId in payload', body);
      return res.status(400).json({ error: 'Missing transactionId' });
    }

    // Find payment by our transaction_id or mistic_transaction_id
    let { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (!payment) {
      // Try mistic_transaction_id
      const { data: p2 } = await supabase
        .from('payments')
        .select('*')
        .eq('mistic_transaction_id', transactionId)
        .single();
      payment = p2;
    }

    if (!payment) {
      console.error('Webhook: payment not found for transactionId:', transactionId);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Already completed — idempotent
    if (payment.status === 'completed') {
      return res.status(200).json({ ok: true, already_fulfilled: true });
    }

    // Verify with MisticPay server-to-server
    const verifyRes = await fetch('https://api.misticpay.com/api/cashin/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': misticClientSecret,
      },
      body: JSON.stringify({ transactionId: payment.transaction_id }),
    });

    if (!verifyRes.ok) {
      console.error('Webhook: MisticPay verify failed:', verifyRes.status);
      // Still return 200 to prevent retries — we'll poll later
      return res.status(200).json({ ok: false, error: 'Verification failed' });
    }

    const verifyData = await verifyRes.json();
    const confirmedState = verifyData.transactionState || verifyData.state || verifyData.status;

    // Only fulfill if MisticPay confirms completion
    const isCompleted = ['completed', 'paid', 'approved', 'COMPLETED', 'PAID'].includes(confirmedState);
    if (!isCompleted) {
      return res.status(200).json({ ok: true, state: confirmedState, awaiting_completion: true });
    }

    // Fulfill via DB function (idempotent, row-locked)
    const { data: result, error: fulfillError } = await supabase.rpc('fulfill_payment', {
      p_payment_id: payment.id,
    });

    if (fulfillError) {
      console.error('Webhook: fulfillment error:', fulfillError);
      return res.status(500).json({ error: 'Fulfillment failed' });
    }

    console.log('Webhook: payment fulfilled:', payment.id, result);
    return res.status(200).json({ ok: true, fulfilled: true });
  } catch (err) {
    console.error('payment-webhook error:', err);
    // Return 200 to prevent webhook retries on server errors
    return res.status(200).json({ ok: false, error: 'Internal error' });
  }
}
