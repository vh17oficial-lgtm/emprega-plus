import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const misticClientId = process.env.MISTICPAY_CLIENT_ID;
const misticClientSecret = process.env.MISTICPAY_CLIENT_SECRET;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check with MisticPay if a transaction is paid.
// Tries multiple endpoints, both IDs (mistic + ours), and both auth schemes.
async function verifyWithMisticPay({ misticId, ourId }) {
  const endpoints = [
    'https://api.misticpay.com/api/cashin/check',
    'https://api.misticpay.com/api/transactions/check',
    'https://api.misticpay.com/api/transactions/status',
  ];
  const ids = [misticId, ourId].filter(Boolean);
  const headerVariants = [
    { 'ci': misticClientId, 'cs': misticClientSecret },
    { 'x-api-key': misticClientSecret },
  ];

  for (const endpoint of endpoints) {
    for (const id of ids) {
      for (const authHeaders of headerVariants) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ transactionId: id }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const inner = data.data || data;
          console.log(`MisticPay check OK [${endpoint}] id=${id}:`, JSON.stringify(data));
          return inner;
        } catch (err) {
          console.error(`MisticPay check error [${endpoint}] id=${id}:`, err.message);
        }
      }
    }
  }
  console.error('MisticPay check: all attempts failed');
  return null;
}

// Check if transaction state means "paid"
function isPaidState(state) {
  if (!state) return false;
  const s = state.toUpperCase();
  return ['COMPLETED', 'PAID', 'APPROVED', 'APROVADO', 'CONCLUIDO', 'CONCLUÍDA',
    'COMPLETO', 'COMPLETA', 'PAGO', 'PAGA', 'FINALIZADO', 'FINALIZADA',
    'SETTLED', 'SUCCESS'].includes(s);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Token inválido' });

    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId é obrigatório' });

    // Read payment from DB (ensure user owns it)
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Already completed
    if (payment.status === 'completed') {
      return res.status(200).json({
        status: 'completed',
        productName: payment.product_name,
        amount: payment.amount,
        completedAt: payment.completed_at,
      });
    }

    // Check expiry
    if (payment.status === 'pending' && new Date(payment.expires_at) < new Date()) {
      await supabase.from('payments').update({ status: 'expired' }).eq('id', payment.id);
      return res.status(200).json({ status: 'expired' });
    }

    // ACTIVE VERIFICATION: if still pending, check MisticPay directly
    if (payment.status === 'pending') {
      const misticResult = await verifyWithMisticPay({
        misticId: payment.mistic_transaction_id,
        ourId: payment.transaction_id,
      });

      if (misticResult) {
        const state = misticResult.transactionState || misticResult.state || misticResult.status;

        if (isPaidState(state)) {
          // Fulfill the payment
          const { data: result, error: fulfillError } = await supabase.rpc('fulfill_payment', {
            p_payment_id: payment.id,
          });

          if (fulfillError) {
            console.error('check-payment: fulfillment error:', fulfillError);
            return res.status(200).json({ status: 'pending', error: 'Fulfillment failed' });
          }

          console.log('check-payment: fulfilled via active check:', payment.id, result);
          return res.status(200).json({
            status: 'completed',
            productName: payment.product_name,
            amount: payment.amount,
          });
        }
      }
    }

    return res.status(200).json({
      status: payment.status,
      productName: payment.product_name,
      amount: payment.amount,
    });
  } catch (err) {
    console.error('check-payment error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
