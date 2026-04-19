import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const misticClientId = process.env.MISTICPAY_CLIENT_ID;
const misticClientSecret = process.env.MISTICPAY_CLIENT_SECRET;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function isPaidState(state) {
  if (!state) return false;
  const s = state.toUpperCase();
  return ['COMPLETED', 'PAID', 'APPROVED', 'APROVADO', 'CONCLUIDO', 'CONCLUÍDA',
    'PAGO', 'PAGA', 'FINALIZADO', 'FINALIZADA', 'SETTLED', 'SUCCESS'].includes(s);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Webhook received:', JSON.stringify(body));

    // MisticPay may wrap payload in "data" object
    const inner = body.data || body;
    const transactionId = inner.transactionId || inner.transaction_id || body.transactionId || body.transaction_id;
    const state = inner.transactionState || inner.state || inner.status || body.transactionState || body.state;

    if (!transactionId) {
      console.error('Webhook: no transactionId in payload');
      return res.status(400).json({ error: 'Missing transactionId' });
    }

    // Find payment by our transaction_id or mistic_transaction_id
    let { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (!payment) {
      const { data: p2 } = await supabase
        .from('payments')
        .select('*')
        .eq('mistic_transaction_id', transactionId)
        .single();
      payment = p2;
    }

    if (!payment) {
      console.error('Webhook: payment not found for transactionId:', transactionId);
      return res.status(200).json({ error: 'Payment not found' });
    }

    // Already completed — idempotent
    if (payment.status === 'completed') {
      return res.status(200).json({ ok: true, already_fulfilled: true });
    }

    // Check if the state from webhook is already "paid"
    if (isPaidState(state)) {
      // Fulfill directly — webhook already confirmed payment
      const { data: result, error: fulfillError } = await supabase.rpc('fulfill_payment', {
        p_payment_id: payment.id,
      });
      if (fulfillError) {
        console.error('Webhook: fulfillment error:', fulfillError);
        return res.status(200).json({ error: 'Fulfillment failed' });
      }
      console.log('Webhook: fulfilled directly:', payment.id, result);
      return res.status(200).json({ ok: true, fulfilled: true });
    }

    // If state isn't clearly paid, verify with MisticPay server-to-server
    try {
      const verifyRes = await fetch('https://api.misticpay.com/api/cashin/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ci': misticClientId,
          'cs': misticClientSecret,
        },
        body: JSON.stringify({ transactionId: payment.transaction_id }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        const vInner = verifyData.data || verifyData;
        const confirmedState = vInner.transactionState || vInner.state || vInner.status;
        console.log('Webhook verify response:', JSON.stringify(verifyData));

        if (isPaidState(confirmedState)) {
          const { data: result, error: fulfillError } = await supabase.rpc('fulfill_payment', {
            p_payment_id: payment.id,
          });
          if (fulfillError) {
            console.error('Webhook: fulfillment error:', fulfillError);
            return res.status(200).json({ error: 'Fulfillment failed' });
          }
          console.log('Webhook: fulfilled via verify:', payment.id, result);
          return res.status(200).json({ ok: true, fulfilled: true });
        }
      }
    } catch (verifyErr) {
      console.error('Webhook: verify call failed:', verifyErr);
    }

    return res.status(200).json({ ok: true, state, awaiting_completion: true });
  } catch (err) {
    console.error('payment-webhook error:', err);
    return res.status(200).json({ ok: false, error: 'Internal error' });
  }
}
