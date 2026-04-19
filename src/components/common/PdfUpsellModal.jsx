import { useState, useEffect } from 'react';
import Portal from './Portal';
import PaymentModal from './PaymentModal';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function PdfUpsellModal({ isOpen, onClose, onUnlocked }) {
  const { siteConfig } = useAppContext();
  const { refreshProfile } = useAuth();
  const [showPayment, setShowPayment] = useState(false);

  const plan = {
    id: 'pdf-download',
    name: siteConfig?.pdfDownloadPlan?.name || 'Download de Currículo em PDF',
    price: siteConfig?.pdfDownloadPlan?.price ?? 12.90,
    credits: 1,
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setShowPayment(false);
  }, [isOpen]);

  if (!isOpen) return null;

  if (showPayment) {
    return (
      <PaymentModal
        isOpen={true}
        onClose={() => setShowPayment(false)}
        plan={plan}
        productType="pdf_unlock"
        productId="pdf-download"
        onComplete={() => {
          refreshProfile();
          setShowPayment(false);
          onUnlocked(plan.price);
        }}
      />
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[pdfFadeIn_0.2s]" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[pdfSlideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-4xl mb-3">📄</div>
            <h2 className="text-lg font-bold">Baixe seu currículo em PDF profissional</h2>
            <p className="text-sm text-white/80 mt-1.5">
              Seu currículo já está pronto! Para baixar em PDF e usar fora da plataforma, libere o acesso abaixo.
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Benefits */}
            <div className="space-y-3 mb-5">
              {[
                { icon: '📥', text: 'Download ilimitado após liberar' },
                { icon: '🎨', text: 'PDF com layout profissional e moderno' },
                { icon: '📱', text: 'Pronto para enviar por WhatsApp ou e-mail' },
                { icon: '🖨️', text: 'Ideal para imprimir e levar em entrevistas' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{b.icon}</span>
                  <span className="text-sm text-gray-700">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-5 text-center border border-indigo-100">
              <p className="text-xs text-indigo-600 font-medium mb-1">Acesso vitalício</p>
              <div>
                <span className="text-xs text-gray-400">R$</span>
                <span className="text-3xl font-extrabold text-indigo-700 ml-1">
                  {plan.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-xs text-indigo-500 mt-1">Pagamento único via Pix</p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-[0.98]"
            >
              🔓 Liberar download agora
            </button>

            {/* Reassurance */}
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <p className="text-xs text-emerald-700 leading-relaxed">
                💚 <strong>Não se preocupe:</strong> mesmo sem pagar, seu currículo já está salvo e você pode continuar se candidatando normalmente.
              </p>
            </div>

            {/* Skip */}
            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Continuar usando grátis
            </button>

            <p className="text-center text-[10px] text-gray-300 mt-3">
              🔒 Pagamento seguro via Pix • Mais de 1.400 downloads realizados
            </p>
          </div>
        </div>

        <style>{`
          @keyframes pdfFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pdfSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    </Portal>
  );
}
