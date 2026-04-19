import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Check expiry
    if (payment.status === 'pending' && new Date(payment.expires_at) < new Date()) {
      await supabase
        .from('payments')
        .update({ status: 'expired' })
        .eq('id', payment.id);
      return res.status(200).json({ status: 'expired' });
    }

    return res.status(200).json({
      status: payment.status,
      productName: payment.product_name,
      amount: payment.amount,
      completedAt: payment.completed_at,
    });
  } catch (err) {
    console.error('check-payment error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
