import { useState, useEffect } from 'react';
import Portal from './Portal';

function MockQRCode({ size = 180 }) {
  const modules = 25;
  const s = size / modules;
  const rects = [];
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inFinder =
        (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
      let fill = false;
      if (inFinder) {
        const fr = r < 7 ? r : r - (modules - 7);
        const fc = c < 7 ? c : c - (modules - 7);
        fill = fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4);
      } else if (r === 7 || c === 7) {
        fill = (r + c) % 2 === 0;
      } else {
        fill = ((r * 7 + c * 13 + r * c * 3) % 5) < 2;
      }
      if (fill)
        rects.push(
          <rect key={`${r}-${c}`} x={c * s} y={r * s} width={s} height={s} fill="#1e1b4b" />
        );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded">
      <rect width={size} height={size} fill="white" />
      {rects}
    </svg>
  );
}

export default function PaymentModal({ isOpen, onClose, plan, onComplete }) {
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirming(false);
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setSuccess(true);
      setTimeout(() => {
        onComplete(plan);
      }, 1500);
    }, 2000);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={!confirming && !success ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[scaleIn_0.25s_ease-out]">
        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounceIn_0.4s]">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pagamento confirmado!</h3>
            <p className="text-sm text-gray-500">Seus créditos estão sendo adicionados...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 text-white text-center relative">
              {!confirming && (
                <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
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

            {/* Body */}
            <div className="p-6 text-center">
              <div className="inline-block p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm mb-4">
                <MockQRCode size={180} />
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Escaneie o QR Code com o app do seu banco
              </p>
              <p className="text-xs text-gray-400 mb-6">
                O pagamento é processado instantaneamente
              </p>

              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {confirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verificando pagamento...
                  </span>
                ) : (
                  '✓ Já paguei'
                )}
              </button>

              {!confirming && (
                <button onClick={onClose} className="mt-3 text-sm text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
                  Cancelar
                </button>
              )}
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
