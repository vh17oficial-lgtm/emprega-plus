import { useState, useEffect, useRef, useCallback } from 'react';
import Portal from './Portal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// CPF mask: 000.000.000-00
function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

const POLL_INTERVAL = 5000; // 5 seconds
const EXPIRE_MINUTES = 15;

export default function PaymentModal({ isOpen, onClose, plan, productType, productId, onComplete }) {
  const { user } = useAuth();
  const [step, setStep] = useState('form'); // form | qr | success | error | expired
  const [payerName, setPayerName] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(EXPIRE_MINUTES * 60);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  // Pre-fill name from user profile
  useEffect(() => {
    if (isOpen && user?.nome) {
      setPayerName(user.nome);
    }
  }, [isOpen, user?.nome]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setCpf('');
      setError('');
      setQrData(null);
      setPaymentId(null);
      setLoading(false);
      setTimeLeft(EXPIRE_MINUTES * 60);
      stopPolling();
      stopTimer();
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => () => { stopPolling(); stopTimer(); }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Start countdown timer
  const startTimer = useCallback((expiresAt) => {
    stopTimer();
    const updateTime = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        stopTimer();
        stopPolling();
        setStep('expired');
      }
    };
    updateTime();
    timerRef.current = setInterval(updateTime, 1000);
  }, [stopTimer, stopPolling]);

  // Start polling for payment status
  const startPolling = useCallback((pId) => {
    stopPolling();
    const poll = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch('/api/check-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ paymentId: pId }),
        });
        const data = await res.json();

        if (data.status === 'completed') {
          stopPolling();
          stopTimer();
          setStep('success');
          setTimeout(() => { onComplete(); }, 1800);
        } else if (data.status === 'expired' || data.status === 'failed') {
          stopPolling();
          stopTimer();
          setStep(data.status === 'expired' ? 'expired' : 'error');
          setError(data.status === 'expired' ? 'PIX expirado' : 'Pagamento falhou');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
  }, [stopPolling, stopTimer, onComplete]);

  const handleGeneratePix = async () => {
    setError('');
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) { setError('CPF deve ter 11 dígitos'); return; }
    if (!payerName.trim() || payerName.trim().length < 3) { setError('Informe seu nome completo'); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { setError('Sessão expirada. Faça login novamente.'); setLoading(false); return; }

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          productType: productType || 'send_credits',
          productId: productId || plan?.id,
          payerName: payerName.trim(),
          payerDocument: cleanCpf,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao gerar PIX'); setLoading(false); return; }

      setQrData(data);
      setPaymentId(data.paymentId);
      setStep('qr');
      startPolling(data.paymentId);
      startTimer(data.expiresAt);
    } catch (err) {
      console.error('Generate PIX error:', err);
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  if (!isOpen || !plan) return null;

  const isLocked = step === 'qr' || step === 'success';
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={!isLocked ? onClose : undefined} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[scaleIn_0.25s_ease-out]">

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounceIn_0.4s]">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pagamento confirmado!</h3>
              <p className="text-sm text-gray-500">Seu acesso está sendo liberado...</p>
            </div>
          )}

          {/* EXPIRED */}
          {step === 'expired' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">PIX expirado</h3>
              <p className="text-sm text-gray-500 mb-4">O tempo para pagamento se esgotou.</p>
              <button onClick={() => { setStep('form'); setQrData(null); setError(''); }}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 cursor-pointer transition-colors">
                Tentar novamente
              </button>
              <button onClick={onClose} className="block mx-auto mt-3 text-sm text-gray-400 hover:text-gray-600 cursor-pointer">
                Fechar
              </button>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Erro no pagamento</h3>
              <p className="text-sm text-gray-500 mb-4">{error || 'Ocorreu um erro inesperado.'}</p>
              <button onClick={() => { setStep('form'); setQrData(null); setError(''); }}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 cursor-pointer transition-colors">
                Tentar novamente
              </button>
              <button onClick={onClose} className="block mx-auto mt-3 text-sm text-gray-400 hover:text-gray-600 cursor-pointer">
                Fechar
              </button>
            </div>
          )}

          {/* FORM (CPF + Name) */}
          {step === 'form' && (
            <>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 text-white text-center relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-7.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5z" />
                  </svg>
                  <span className="text-sm font-medium text-white/90">Pagamento via Pix</span>
                </div>
                <p className="text-3xl font-extrabold">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-white/80 mt-0.5">{plan.name}</p>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      inputMode="numeric"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-3">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGeneratePix}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Gerando PIX...
                    </span>
                  ) : '🔐 Gerar QR Code PIX'}
                </button>

                <button onClick={onClose} className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                  Cancelar
                </button>

                <p className="text-center text-[10px] text-gray-300 mt-3">
                  🔒 Pagamento seguro via Pix • Dados protegidos
                </p>
              </div>
            </>
          )}

          {/* QR CODE */}
          {step === 'qr' && qrData && (
            <>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 text-white text-center relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-7.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5z" />
                  </svg>
                  <span className="text-sm font-medium text-white/90">Pagamento via Pix</span>
                </div>
                <p className="text-3xl font-extrabold">
                  R$ {(qrData.amount || plan.price).toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-white/80 mt-0.5">{qrData.productName || plan.name}</p>
              </div>

              <div className="p-6 text-center">
                {/* Timer */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                  timeLeft <= 60 ? 'bg-red-100 text-red-700' : timeLeft <= 180 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <span>⏱️</span>
                  <span>Expira em {formattedTime}</span>
                </div>

                {/* QR Code */}
                <div className="inline-block p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm mb-4">
                  {qrData.qrCodeBase64 ? (
                    <img src={qrData.qrCodeBase64.startsWith('data:') ? qrData.qrCodeBase64 : `data:image/png;base64,${qrData.qrCodeBase64}`}
                      alt="QR Code PIX" width={200} height={200} className="rounded" />
                  ) : qrData.qrCodeUrl ? (
                    <img src={qrData.qrCodeUrl} alt="QR Code PIX" width={200} height={200} className="rounded" />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 text-sm">
                      QR Code indisponível
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  Escaneie o QR Code com o app do seu banco
                </p>

                {/* PIX Copia e Cola */}
                {qrData.copyPaste && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(qrData.copyPaste); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="w-full mb-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors truncate"
                  >
                    {copied ? '✅ Código copiado!' : '📋 Copiar código Pix Copia e Cola'}
                  </button>
                )}

                {/* Polling indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Aguardando pagamento...
                </div>

                <p className="text-center text-[10px] text-gray-300">
                  🔒 Pagamento seguro via Pix • Confirmação automática
                </p>
              </div>
            </>
          )}
        </div>

        <style>{`
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    </Portal>
  );
}
