// Central configuration defaults — all admin-editable content

export const defaultSiteConfig = {
  // Platform identity
  platformName: 'Emprega+',
  platformTagline: 'A plataforma que conecta você às melhores oportunidades de emprego do Brasil.',
  platformBadge: 'Plataforma 100% gratuita',

  // Hero stats
  heroStats: [
    { value: '1.200+', label: 'Currículos criados' },
    { value: '340+', label: 'Vagas disponíveis' },
    { value: '2.800+', label: 'Candidaturas enviadas' },
  ],

  // Hero CTA buttons
  heroCta: 'CRIAR MEU CURRÍCULO AGORA',
  heroCtaSecondary: 'Ver vagas disponíveis',
  heroCtaTertiary: 'Já tenho currículo',

  // How It Works section headers
  howItWorksTag: 'Simples e rápido',
  howItWorksTitle: 'Três passos para o seu próximo emprego',
  howItWorksSubtitle: 'Sem complicação. Sem burocracia. Comece agora e se candidate em minutos.',

  // Featured Jobs section
  featuredTag: 'Oportunidades',
  featuredTitle: 'Vagas em destaque',
  featuredSubtitle: 'As melhores oportunidades selecionadas para você.',
  featuredCta: 'Ver todas as vagas →',

  // Footer
  footerDescription: 'A plataforma que conecta você às melhores oportunidades de emprego do Brasil.',

  // Onboarding checklist
  onboardingTitle: '🎯 Seus próximos passos',
  onboardingSubtitle: 'Complete para aumentar suas chances',
  onboardingSteps: [
    { id: 'resume', label: 'Criar ou enviar currículo', description: 'Monte seu currículo profissional ou envie o seu', icon: '📝', tab: 'curriculo' },
    { id: 'browse', label: 'Explorar vagas disponíveis', description: 'Encontre oportunidades que combinam com você', icon: '🔍', tab: 'vagas' },
    { id: 'apply', label: 'Se candidatar a uma vaga', description: 'Envie seu currículo e conquiste sua vaga', icon: '🚀', tab: 'vagas' },
  ],

  // Application modal steps
  applicationSteps: [
    { text: 'Preparando seu currículo...', icon: '📄' },
    { text: 'Anexando arquivo PDF...', icon: '📎' },
    { text: 'Conectando com a empresa...', icon: '🔗' },
    { text: 'Enviando candidatura...', icon: '📤' },
    { text: 'Candidatura enviada com sucesso!', icon: '✅' },
  ],
  applicationSuccessTitle: '🎉 Candidatura Enviada!',
  applicationSuccessText: '✅ A empresa pode entrar em contato com você em breve. Boa sorte!',

  // System messages
  messages: {
    noResume: 'Você ainda não tem um currículo salvo. Crie um currículo na aba "Criar Currículo" antes de se candidatar.',
    noResults: 'Nenhuma vaga encontrada. Tente ajustar os filtros para ver mais resultados.',
    noApplications: 'Acesse a aba "Explorar Vagas" e envie seu currículo para começar a se candidatar.',
    applicationSent: 'As empresas podem entrar em contato com você em breve. Boa sorte!',
    paymentConfirmed: 'Pagamento confirmado!',
    paymentProcessing: 'Seus créditos estão sendo adicionados...',
    paymentSecure: '🔒 Pagamento seguro via Pix',
    creditsInstant: '⚡ Créditos liberados na hora',
    resumeSelectTitle: 'Escolha qual currículo deseja enviar',
    emailExists: 'Este email já está cadastrado.',
    jobInfoNote: 'Para mais informações sobre a vaga, detalhes do processo seletivo e benefícios, consulte diretamente com a empresa durante a entrevista.',
  },

  // Priority resume upsell
  priorityPlan: {
    name: 'Currículo com Prioridade',
    description: 'Destaque seu currículo nas empresas',
    price: 9.99,
  },

  // PDF download upsell
  pdfDownloadPlan: {
    name: 'Download de Currículo em PDF',
    description: 'Baixe seu currículo profissional em PDF',
    price: 12.90,
  },

  // Auto dispatch
  dispatchOptions: [10, 20, 30, 40, 50],

  // System rules
  rules: {
    freeSendCredits: 1,
    maxResumesPerUser: 10,
    featuredJobsCount: 6,
  },

  // Banner / Announcement
  banner: {
    enabled: false,
    text: '',
    type: 'info', // info, warning, success, promo
    dismissible: true,
  },

  // Maintenance mode
  maintenance: {
    enabled: false,
    title: 'Em manutenção',
    message: 'Estamos realizando melhorias na plataforma. Voltamos em breve!',
  },

  // SEO
  seo: {
    title: 'Emprega+ | Plataforma de Empregabilidade',
    description: 'Crie seu currículo profissional em minutos e se candidate a vagas de emprego com um clique. Plataforma gratuita.',
    keywords: 'emprego, currículo, vagas, trabalho, candidatura, empregabilidade',
    ogImage: '',
  },

  // Section visibility on landing page
  sections: {
    brandMarquee: true,
    howItWorks: true,
    benefits: true,
    testimonials: true,
    mediaShowcase: true,
    featuredJobs: true,
    ctaSection: true,
    reviews: true,
  },
};

export const defaultRotationConfig = {
  enabled: true,
  intervalDays: 3,
  rotateCount: 50,
  closedMessages: [
    'Processo seletivo encerrado',
    'Vaga finalizada pela empresa',
    'A empresa encerrou as candidaturas para esta vaga',
  ],
};
