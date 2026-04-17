import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

const firstNames = [
  'Carlos', 'Ana', 'João', 'Mariana', 'Pedro', 'Juliana', 'Rafael', 'Camila',
  'Lucas', 'Fernanda', 'Bruno', 'Beatriz', 'Thiago', 'Larissa', 'Diego',
  'Isabela', 'Gustavo', 'Patrícia', 'Mateus', 'Renata', 'Felipe', 'Amanda',
  'Leonardo', 'Gabriela', 'Vinícius', 'Letícia', 'André', 'Natália',
];

const states = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'PE', 'CE', 'DF', 'GO', 'PA', 'MA', 'ES', 'PB'];

const jobTitles = [
  'Assistente Administrativo', 'Auxiliar de Escritório', 'Vendedor(a)',
  'Recepcionista', 'Motorista', 'Estoquista', 'Operador de Caixa',
  'Analista de Marketing', 'Desenvolvedor(a)', 'Atendente',
  'Auxiliar de Produção', 'Técnico de Manutenção', 'Designer Gráfico',
  'Enfermeiro(a)', 'Cozinheiro(a)',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randTime = () => {
  const mins = Math.floor(Math.random() * 25) + 1;
  if (mins === 1) return 'há 1 minuto';
  if (mins < 60) return `há ${mins} minutos`;
  return 'há 1 hora';
};

function resolveTemplate(template) {
  return template
    .replace(/\{name\}/gi, pick(firstNames))
    .replace(/\{nome\}/gi, pick(firstNames))
    .replace(/\{initial\}/gi, pick(firstNames).charAt(0))
    .replace(/\{inicial\}/gi, pick(firstNames).charAt(0))
    .replace(/\{state\}/gi, pick(states))
    .replace(/\{estado\}/gi, pick(states))
    .replace(/\{job\}/gi, pick(jobTitles))
    .replace(/\{vaga\}/gi, pick(jobTitles));
}

function getTimeText(format) {
  if (format === 'now') return 'agora mesmo';
  if (format === 'relative') return randTime();
  return Math.random() > 0.3 ? randTime() : 'agora mesmo';
}

export default function SocialProofToast() {
  const { socialProofConfig } = useAppContext();
  const configRef = useRef(socialProofConfig);
  configRef.current = socialProofConfig;

  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);
  const scheduleRef = useRef(null);
  const lastIdRef = useRef(null);

  const showToast = useCallback(() => {
    const cfg = configRef.current;
    const active = cfg.messages.filter((m) => m.active);
    if (active.length === 0) return;

    let msg;
    if (cfg.noRepeat && active.length > 1) {
      let candidate;
      do { candidate = pick(active); } while (candidate.id === lastIdRef.current);
      msg = candidate;
    } else {
      msg = pick(active);
    }
    lastIdRef.current = msg.id;

    setToast({
      icon: msg.icon,
      text: resolveTemplate(msg.template),
      time: getTimeText(cfg.timeFormat),
    });
    setVisible(true);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), cfg.displayDuration * 1000);
  }, []);

  // Stable key: only restart the cycle when enabled changes or message count reaches 0
  const enabled = socialProofConfig.enabled;
  const hasActiveMessages = socialProofConfig.messages.some((m) => m.active);

  useEffect(() => {
    if (!enabled || !hasActiveMessages) {
      setVisible(false);
      return;
    }

    const scheduleNext = () => {
      const cfg = configRef.current;
      const minMs = cfg.intervalMin * 1000;
      const maxMs = cfg.intervalMax * 1000;
      const delay = minMs + Math.random() * (maxMs - minMs);
      scheduleRef.current = setTimeout(() => {
        showToast();
        scheduleNext();
      }, delay);
    };

    const initialDelay = setTimeout(() => {
      showToast();
      scheduleNext();
    }, 8000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeoutRef.current);
      clearTimeout(scheduleRef.current);
    };
  }, [enabled, hasActiveMessages, showToast]);

  if (!enabled || !toast) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-40 transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-[300px] sm:max-w-xs">
        <span className="text-lg shrink-0">{toast.icon}</span>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-700 leading-snug">{toast.text}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{toast.time}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer shrink-0 ml-1"
          aria-label="Fechar"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
