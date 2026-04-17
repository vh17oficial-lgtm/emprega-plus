export const defaultSendPlans = [
  { id: 'send-10', name: '10 Envios', credits: 10, price: 4.99, active: true, popular: false },
  { id: 'send-20', name: '20 Envios', credits: 20, price: 8.99, active: true, popular: false },
  { id: 'send-50', name: '50 Envios', credits: 50, price: 14.99, active: true, popular: true },
];

export const defaultAutoDispatchConfig = {
  basePrice: 9.99,
  initialDailyLimit: 10,
  upgrades: [
    { id: 'dispatch-10', label: '+10 disparos/dia', amount: 10, price: 4.99 },
    { id: 'dispatch-20', label: '+20 disparos/dia', amount: 20, price: 8.99 },
    { id: 'dispatch-50', label: '+50 disparos/dia', amount: 50, price: 19.99 },
    { id: 'dispatch-unlimited', label: 'Ilimitado', amount: -1, price: 69.99 },
  ],
};

export const defaultUpsellTexts = {
  sendLimitTitle: 'Você atingiu o limite de envios',
  sendLimitText: 'Para continuar se candidatando, escolha um pacote abaixo:',
  dispatchLockedTitle: 'Desbloqueie o Disparo Automático',
  dispatchLockedText: 'Envie seu currículo para dezenas de vagas automaticamente com apenas um clique.',
  dispatchLimitTitle: 'Limite diário atingido',
  dispatchLimitText: 'Aumente seu limite diário de disparos automáticos:',
};

export const FREE_SEND_CREDITS = 1;
