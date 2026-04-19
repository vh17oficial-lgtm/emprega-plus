import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const misticClientId = process.env.MISTICPAY_CLIENT_ID;
const misticClientSecret = process.env.MISTICPAY_CLIENT_SECRET;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validate CPF (Brazilian tax ID)
function isValidCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(digits[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(digits[10]) === check;
}

// Resolve product price from DB (server-side truth)
async function resolveProduct(productType, productId) {
  const { data: configRow } = await supabase
    .from('site_config')
    .select('config')
    .eq('id', 1)
    .single();

  const config = configRow?.config || {};

  switch (productType) {
    case 'send_credits': {
      const { data: plansRow } = await supabase
        .from('send_plans')
        .select('plans')
        .eq('id', 1)
        .single();
      const plans = plansRow?.plans || [
        { id: 'send-10', name: '10 Envios', credits: 10, price: 4.99 },
        { id: 'send-20', name: '20 Envios', credits: 20, price: 8.99 },
        { id: 'send-50', name: '50 Envios', credits: 50, price: 14.99 },
      ];
      const plan = plans.find(p => p.id === productId);
      if (!plan) return null;
      return { name: plan.name, price: plan.price, grantedValue: plan.credits };
    }

    case 'auto_dispatch': {
      const { data: dispatchRow } = await supabase
        .from('auto_dispatch_config')
        .select('config')
        .eq('id', 1)
        .single();
      const dispatchConfig = dispatchRow?.config || { basePrice: 9.99, initialDailyLimit: 10 };
      return {
        name: 'Disparador Automático',
        price: dispatchConfig.basePrice,
        grantedValue: dispatchConfig.initialDailyLimit,
      };
    }

    case 'daily_limit_upgrade': {
      const { data: dispatchRow } = await supabase
        .from('auto_dispatch_config')
        .select('config')
        .eq('id', 1)
        .single();
      const dispatchConfig = dispatchRow?.config || { upgrades: [] };
      const upgrade = (dispatchConfig.upgrades || []).find(u => u.id === productId);
      if (!upgrade) return null;
      return { name: upgrade.label, price: upgrade.price, grantedValue: upgrade.amount };
    }

    case 'priority': {
      const priorityPlan = config.priorityPlan || { name: 'Currículo com Prioridade', price: 9.99 };
      return { name: priorityPlan.name, price: priorityPlan.price, grantedValue: 1 };
    }

    case 'pdf_unlock': {
      const pdfPlan = config.pdfDownloadPlan || { name: 'Download de Currículo em PDF', price: 12.90 };
      return { name: pdfPlan.name, price: pdfPlan.price, grantedValue: 1 };
    }

    default:
      return null;
  }
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

    const { productType, productId, payerName, payerDocument } = req.body;

    // Validate inputs
    if (!productType || !productId) {
      return res.status(400).json({ error: 'productType e productId são obrigatórios' });
    }

    const cpf = (payerDocument || '').replace(/\D/g, '');
    if (!isValidCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    const name = (payerName || '').trim();
    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'Nome completo é obrigatório (mínimo 3 caracteres)' });
    }

    // Resolve product from server-side catalog
    const product = await resolveProduct(productType, productId);
    if (!product) {
      return res.status(400).json({ error: 'Produto não encontrado' });
    }

    // Generate unique transaction ID
    const transactionId = `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create payment record in DB first
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        product_type: productType,
        product_id: productId,
        product_name: product.name,
        amount: product.price,
        granted_value: product.grantedValue,
        transaction_id: transactionId,
        status: 'pending',
        payer_name: name,
        payer_document: cpf,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('DB insert error:', insertError);
      return res.status(500).json({ error: 'Erro ao criar pagamento' });
    }

    // Call MisticPay API
    const webhookUrl = 'https://www.empregaplus.com/api/payment-webhook';
    const misticRes = await fetch('https://api.misticpay.com/api/transactions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ci': misticClientId,
        'cs': misticClientSecret,
      },
      body: JSON.stringify({
        amount: product.price,
        payerName: name,
        payerDocument: cpf,
        transactionId,
        description: `Emprega+ - ${product.name}`,
        projectWebhook: webhookUrl,
      }),
    });

    if (!misticRes.ok) {
      const errorText = await misticRes.text();
      console.error('MisticPay error:', misticRes.status, errorText);
      // Mark payment as failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);
      return res.status(502).json({ error: 'Erro ao gerar PIX. Tente novamente.' });
    }

    const misticData = await misticRes.json();

    // MisticPay wraps response in a "data" object
    const mData = misticData.data || misticData;
    const qrBase64 = mData.qrCodeBase64 || null;
    const qrUrl = mData.qrcodeUrl || mData.qrCode || null;
    const misticTxId = mData.transactionId || null;
    const copyPaste = mData.copyPaste || null;

    // Update payment with MisticPay data
    await supabase
      .from('payments')
      .update({
        mistic_transaction_id: misticTxId,
        qr_code_base64: qrBase64,
        qr_code_url: qrUrl,
      })
      .eq('id', payment.id);

    return res.status(200).json({
      paymentId: payment.id,
      qrCodeBase64: qrBase64,
      qrCodeUrl: qrUrl,
      copyPaste,
      amount: product.price,
      productName: product.name,
      expiresAt,
    });
  } catch (err) {
    console.error('create-payment error:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
