// Realistic sample resume data for auto-fill feature
// Each profile has multiple variations to avoid repetition

const NOMES_FEMININOS = [
  'Ana Carolina Silva', 'Juliana Ferreira Costa', 'Mariana Oliveira Santos',
  'Camila Rodrigues Lima', 'Fernanda Almeida Souza', 'Beatriz Nascimento Pereira',
  'Larissa Martins Gomes', 'Gabriela Barbosa Dias', 'Carolina Ribeiro Mendes',
  'Amanda Carvalho Lopes', 'Rafaela Moreira Vieira', 'Letícia Araújo Nunes',
];

const NOMES_MASCULINOS = [
  'Lucas Andrade Pereira', 'Rafael Souza Santos', 'Thiago Oliveira Lima',
  'Matheus Ferreira Costa', 'Pedro Henrique Almeida', 'Bruno Nascimento Silva',
  'Felipe Rodrigues Gomes', 'Guilherme Barbosa Dias', 'João Victor Ribeiro',
  'Daniel Martins Carvalho', 'Vinícius Moreira Lopes', 'Caio Araújo Mendes',
];

const CIDADES = [
  'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
  'Curitiba, PR', 'Porto Alegre, RS', 'Salvador, BA',
  'Brasília, DF', 'Recife, PE', 'Fortaleza, CE',
  'Campinas, SP', 'Goiânia, GO', 'Florianópolis, SC',
];

const TELEFONES = [
  '(11) 98765-4321', '(21) 97654-3210', '(31) 99876-5432',
  '(41) 98543-2109', '(51) 99432-1098', '(71) 98321-0987',
  '(61) 97210-9876', '(81) 99109-8765', '(85) 98098-7654',
  '(19) 97987-6543', '(62) 98876-5432', '(48) 99765-4321',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomName() {
  return Math.random() > 0.5 ? pick(NOMES_FEMININOS) : pick(NOMES_MASCULINOS);
}

function nameToEmail(nome) {
  const parts = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ');
  const domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com.br'];
  return `${parts[0]}.${parts[parts.length - 1]}@${pick(domains)}`;
}

function nameToLinkedin(nome) {
  const parts = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ');
  return `linkedin.com/in/${parts[0]}-${parts[parts.length - 1]}`;
}

// ─── ADMINISTRATIVO ───────────────────────────

const adminProfiles = [
  {
    cargo: 'Assistente Administrativo',
    resumo: 'Profissional com sólida experiência em rotinas administrativas, controle de documentos e atendimento ao público. Organizada, proativa e com domínio de ferramentas de escritório. Busco contribuir com eficiência operacional e qualidade no atendimento.',
    experiences: [
      {
        empresa: 'Grupo Pão de Açúcar',
        cargo: 'Assistente Administrativo',
        inicio: 'Mar 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Controle de documentos, contratos e arquivos físicos e digitais',
          'Atendimento telefônico e presencial a clientes e fornecedores',
          'Emissão de notas fiscais e lançamentos no sistema ERP',
          'Organização de agendas e apoio à diretoria',
        ],
      },
      {
        empresa: 'Clínica São Lucas',
        cargo: 'Recepcionista Administrativa',
        inicio: 'Jan 2020',
        fim: 'Fev 2022',
        atual: false,
        funcoes: [
          'Agendamento de consultas e controle de prontuários',
          'Recebimento e conferência de pagamentos',
          'Atualização de cadastros no sistema',
        ],
      },
    ],
    education: [
      { curso: 'Administração de Empresas', instituicao: 'Universidade Anhanguera', ano: '2021' },
    ],
    courses: [
      { nome: 'Excel Avançado', instituicao: 'Senac', ano: '2022' },
      { nome: 'Gestão de Documentos', instituicao: 'Fundação Bradesco', ano: '2021' },
    ],
    skills: ['Pacote Office', 'Atendimento ao cliente', 'Organização', 'ERP SAP', 'Controle de estoque', 'Digitação rápida', 'Arquivo e documentação'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Básico' },
    ],
  },
  {
    cargo: 'Auxiliar Administrativo',
    resumo: 'Profissional dedicado com experiência em rotinas de escritório, organização de documentos e suporte a equipes. Comprometido com prazos e eficiência, busco oportunidades para crescer na área administrativa.',
    experiences: [
      {
        empresa: 'Lojas Renner',
        cargo: 'Auxiliar Administrativo',
        inicio: 'Jun 2021',
        fim: '',
        atual: true,
        funcoes: [
          'Suporte às rotinas administrativas e financeiras do setor',
          'Controle de planilhas de custos e relatórios mensais',
          'Organização de documentos para auditoria interna',
          'Atendimento a fornecedores e parceiros comerciais',
        ],
      },
      {
        empresa: 'Escritório Moreira & Advogados',
        cargo: 'Estagiário Administrativo',
        inicio: 'Fev 2020',
        fim: 'Mai 2021',
        atual: false,
        funcoes: [
          'Digitalização e organização de processos',
          'Controle de prazos processuais',
          'Suporte no atendimento a clientes',
        ],
      },
    ],
    education: [
      { curso: 'Gestão Empresarial', instituicao: 'FATEC', ano: '2022' },
    ],
    courses: [
      { nome: 'Rotinas Administrativas', instituicao: 'Senai', ano: '2021' },
      { nome: 'Informática Básica e Avançada', instituicao: 'Fundação Bradesco', ano: '2020' },
    ],
    skills: ['Excel', 'Word', 'PowerPoint', 'Organização', 'Trabalho em equipe', 'Comunicação', 'Controle financeiro'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Espanhol', nivel: 'Intermediário' },
    ],
  },
  {
    cargo: 'Secretária Executiva',
    resumo: 'Secretária executiva com mais de 4 anos de experiência em gestão de agendas, organização de eventos e suporte a alta diretoria. Habilidade em comunicação corporativa e relacionamento interpessoal.',
    experiences: [
      {
        empresa: 'Banco Itaú',
        cargo: 'Secretária Executiva',
        inicio: 'Ago 2021',
        fim: '',
        atual: true,
        funcoes: [
          'Gestão de agenda de 3 diretores executivos',
          'Organização de viagens nacionais e internacionais',
          'Elaboração de atas de reunião e apresentações',
          'Controle de despesas e prestação de contas',
        ],
      },
      {
        empresa: 'Consultoria Deloitte',
        cargo: 'Assistente de Secretaria',
        inicio: 'Mar 2019',
        fim: 'Jul 2021',
        atual: false,
        funcoes: [
          'Suporte administrativo ao time de consultoria',
          'Reserva de salas e organização de workshops',
          'Recepção de clientes e visitantes',
        ],
      },
    ],
    education: [
      { curso: 'Secretariado Executivo', instituicao: 'Universidade Mackenzie', ano: '2019' },
    ],
    courses: [
      { nome: 'Comunicação Empresarial', instituicao: 'FGV Online', ano: '2022' },
      { nome: 'Gestão do Tempo e Produtividade', instituicao: 'Coursera', ano: '2021' },
    ],
    skills: ['Gestão de agenda', 'Comunicação corporativa', 'Pacote Office avançado', 'Organização de eventos', 'Redação empresarial', 'Discrição e sigilo'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Avançado' },
      { idioma: 'Espanhol', nivel: 'Básico' },
    ],
  },
];

// ─── TECNOLOGIA ───────────────────────────

const techProfiles = [
  {
    cargo: 'Desenvolvedor Front-end',
    resumo: 'Desenvolvedor front-end com experiência em React, JavaScript e criação de interfaces modernas e responsivas. Apaixonado por experiência do usuário e performance web. Busco contribuir em projetos desafiadores com tecnologias atuais.',
    experiences: [
      {
        empresa: 'Nubank',
        cargo: 'Desenvolvedor Front-end Pleno',
        inicio: 'Jan 2023',
        fim: '',
        atual: true,
        funcoes: [
          'Desenvolvimento de interfaces com React e TypeScript',
          'Implementação de design system e componentes reutilizáveis',
          'Otimização de performance e acessibilidade',
          'Code review e mentoria de desenvolvedores júnior',
        ],
      },
      {
        empresa: 'Totvs',
        cargo: 'Desenvolvedor Front-end Júnior',
        inicio: 'Mar 2021',
        fim: 'Dez 2022',
        atual: false,
        funcoes: [
          'Criação de telas e componentes em React',
          'Integração com APIs REST',
          'Testes unitários com Jest e React Testing Library',
        ],
      },
    ],
    education: [
      { curso: 'Análise e Desenvolvimento de Sistemas', instituicao: 'FIAP', ano: '2021' },
    ],
    courses: [
      { nome: 'React Avançado', instituicao: 'Rocketseat', ano: '2022' },
      { nome: 'TypeScript do Zero', instituicao: 'Udemy', ano: '2022' },
      { nome: 'UI/UX Design Fundamentals', instituicao: 'Alura', ano: '2021' },
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'Node.js', 'Figma', 'REST APIs'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Avançado' },
    ],
  },
  {
    cargo: 'Analista de Suporte Técnico',
    resumo: 'Analista de suporte com experiência em atendimento N1/N2, troubleshooting e administração de redes. Foco em resolução rápida de incidentes e satisfação do usuário. Certificações ITIL e Microsoft.',
    experiences: [
      {
        empresa: 'Stefanini IT Solutions',
        cargo: 'Analista de Suporte N2',
        inicio: 'Abr 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Suporte remoto e presencial a mais de 200 usuários',
          'Administração de Active Directory e Office 365',
          'Configuração de estações de trabalho e impressoras',
          'Documentação de procedimentos e base de conhecimento',
        ],
      },
      {
        empresa: 'TechBiz Informática',
        cargo: 'Técnico de Suporte N1',
        inicio: 'Jul 2020',
        fim: 'Mar 2022',
        atual: false,
        funcoes: [
          'Atendimento via telefone, e-mail e chat',
          'Resolução de chamados no ServiceNow',
          'Instalação e manutenção de softwares',
        ],
      },
    ],
    education: [
      { curso: 'Redes de Computadores', instituicao: 'Universidade Estácio', ano: '2020' },
    ],
    courses: [
      { nome: 'ITIL v4 Foundation', instituicao: 'PeopleCert', ano: '2022' },
      { nome: 'Microsoft AZ-900', instituicao: 'Microsoft Learn', ano: '2023' },
    ],
    skills: ['Windows Server', 'Active Directory', 'Office 365', 'Redes TCP/IP', 'ServiceNow', 'ITIL', 'Linux básico', 'Troubleshooting'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Intermediário' },
    ],
  },
  {
    cargo: 'Desenvolvedor Back-end',
    resumo: 'Desenvolvedor back-end com experiência em Java, Spring Boot e arquitetura de microsserviços. Vivência em times ágeis, deploy em cloud AWS e integração contínua. Busco novos desafios em empresas inovadoras.',
    experiences: [
      {
        empresa: 'iFood',
        cargo: 'Desenvolvedor Back-end',
        inicio: 'Set 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Desenvolvimento de microsserviços com Java e Spring Boot',
          'Modelagem de banco de dados PostgreSQL e MongoDB',
          'Deploy e monitoramento em AWS (ECS, S3, CloudWatch)',
          'Participação em cerimônias ágeis (Scrum)',
        ],
      },
      {
        empresa: 'Accenture',
        cargo: 'Desenvolvedor Júnior',
        inicio: 'Fev 2021',
        fim: 'Ago 2022',
        atual: false,
        funcoes: [
          'Desenvolvimento de APIs REST em Java',
          'Criação de testes automatizados com JUnit',
          'Integração com sistemas legados via mensageria',
        ],
      },
    ],
    education: [
      { curso: 'Ciência da Computação', instituicao: 'Universidade Federal de Minas Gerais', ano: '2021' },
    ],
    courses: [
      { nome: 'Arquitetura de Microsserviços', instituicao: 'Alura', ano: '2022' },
      { nome: 'AWS Cloud Practitioner', instituicao: 'AWS', ano: '2023' },
    ],
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'REST APIs', 'Kafka', 'JUnit'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Fluente' },
    ],
  },
];

// ─── VENDAS ───────────────────────────

const salesProfiles = [
  {
    cargo: 'Vendedor Externo',
    resumo: 'Vendedor com forte habilidade de negociação e relacionamento com clientes. Experiência em vendas B2B e B2C, prospecção ativa e fechamento de contratos. Orientado a metas com histórico consistente de superação de resultados.',
    experiences: [
      {
        empresa: 'Ambev',
        cargo: 'Vendedor Externo',
        inicio: 'Mai 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Atendimento e prospecção de mais de 80 clientes na carteira',
          'Negociação comercial e fechamento de contratos',
          'Acompanhamento de metas diárias e semanais',
          'Merchandising e positivação de PDV',
        ],
      },
      {
        empresa: 'Magazine Luiza',
        cargo: 'Consultor de Vendas',
        inicio: 'Out 2020',
        fim: 'Abr 2022',
        atual: false,
        funcoes: [
          'Venda consultiva de eletrodomésticos e eletrônicos',
          'Atendimento presencial e pós-venda',
          'Superação de metas em 15 dos 18 meses',
        ],
      },
    ],
    education: [
      { curso: 'Gestão Comercial', instituicao: 'Universidade Cruzeiro do Sul', ano: '2020' },
    ],
    courses: [
      { nome: 'Técnicas de Negociação', instituicao: 'Sebrae', ano: '2022' },
      { nome: 'Vendas Consultivas', instituicao: 'Conquer', ano: '2021' },
    ],
    skills: ['Negociação', 'Prospecção', 'CRM', 'Atendimento ao cliente', 'Fechamento de vendas', 'Pós-venda', 'Merchandising', 'Metas'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Espanhol', nivel: 'Intermediário' },
    ],
  },
  {
    cargo: 'Consultor de Vendas Internas',
    resumo: 'Consultor de vendas com experiência em inside sales, qualificação de leads e pipeline management. Perfil analítico e comunicativo, com domínio de ferramentas CRM e técnicas de vendas consultivas.',
    experiences: [
      {
        empresa: 'RD Station',
        cargo: 'SDR (Sales Development Representative)',
        inicio: 'Ago 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Prospecção outbound via LinkedIn, e-mail e telefone',
          'Qualificação de leads utilizando framework BANT',
          'Agendamento de reuniões para o time de closers',
          'Gestão de pipeline no HubSpot CRM',
        ],
      },
      {
        empresa: 'Localiza',
        cargo: 'Atendente Comercial',
        inicio: 'Jan 2021',
        fim: 'Jul 2022',
        atual: false,
        funcoes: [
          'Atendimento a clientes corporativos e pessoa física',
          'Elaboração de propostas e orçamentos',
          'Renovação de contratos de locação',
        ],
      },
    ],
    education: [
      { curso: 'Marketing', instituicao: 'Universidade Paulista (UNIP)', ano: '2021' },
    ],
    courses: [
      { nome: 'Inside Sales na Prática', instituicao: 'Reev Academy', ano: '2022' },
      { nome: 'HubSpot Sales Software', instituicao: 'HubSpot Academy', ano: '2023' },
    ],
    skills: ['Inside Sales', 'Prospecção', 'HubSpot', 'LinkedIn Sales Navigator', 'Qualificação de leads', 'Cold calling', 'Comunicação', 'Pipeline management'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Intermediário' },
    ],
  },
  {
    cargo: 'Gerente Comercial',
    resumo: 'Gerente comercial com mais de 5 anos de experiência liderando equipes de vendas e desenvolvendo estratégias comerciais. Forte capacidade de análise de mercado, gestão de indicadores e desenvolvimento de pessoas.',
    experiences: [
      {
        empresa: 'Porto Seguro',
        cargo: 'Gerente Comercial Regional',
        inicio: 'Fev 2022',
        fim: '',
        atual: true,
        funcoes: [
          'Gestão de equipe com 12 consultores comerciais',
          'Definição de estratégias e metas regionais',
          'Acompanhamento de KPIs e relatórios gerenciais',
          'Treinamento e desenvolvimento da equipe',
        ],
      },
      {
        empresa: 'Vivo (Telefônica)',
        cargo: 'Supervisor de Vendas',
        inicio: 'Jun 2019',
        fim: 'Jan 2022',
        atual: false,
        funcoes: [
          'Supervisão de 8 vendedores em loja flagship',
          'Controle de metas e ranking de performance',
          'Implantação de processos de melhoria contínua',
        ],
      },
    ],
    education: [
      { curso: 'Administração de Empresas', instituicao: 'Fundação Getúlio Vargas (FGV)', ano: '2018' },
      { curso: 'MBA em Gestão Comercial', instituicao: 'Insper', ano: '2022' },
    ],
    courses: [
      { nome: 'Liderança de Alta Performance', instituicao: 'FGV Online', ano: '2022' },
      { nome: 'Gestão de Indicadores', instituicao: 'Sebrae', ano: '2021' },
    ],
    skills: ['Gestão de equipes', 'Planejamento estratégico', 'KPIs', 'CRM Salesforce', 'Negociação', 'Treinamento', 'Análise de mercado', 'Liderança'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Avançado' },
      { idioma: 'Espanhol', nivel: 'Intermediário' },
    ],
  },
];

// ─── SEM EXPERIÊNCIA ───────────────────────────

const noExpProfiles = [
  {
    cargo: 'Primeiro Emprego — Administrativo',
    resumo: 'Jovem em busca do primeiro emprego, com grande disposição para aprender e contribuir. Possuo curso técnico em Administração e conhecimentos em informática. Sou pontual, comunicativo e trabalho bem em equipe.',
    experiences: [
      {
        empresa: 'Projeto Social Crescer',
        cargo: 'Voluntário Administrativo',
        inicio: 'Mar 2024',
        fim: 'Nov 2024',
        atual: false,
        funcoes: [
          'Organização de materiais e documentos do projeto',
          'Apoio na divulgação de eventos em redes sociais',
          'Atendimento ao público durante eventos comunitários',
        ],
      },
    ],
    education: [
      { curso: 'Ensino Médio Completo', instituicao: 'Escola Estadual Prof. João Dias', ano: '2024' },
      { curso: 'Técnico em Administração', instituicao: 'ETEC', ano: '2024' },
    ],
    courses: [
      { nome: 'Informática Básica', instituicao: 'Fundação Bradesco', ano: '2024' },
      { nome: 'Atendimento ao Cliente', instituicao: 'Senac', ano: '2024' },
      { nome: 'Jovem Aprendiz — Preparação', instituicao: 'CIEE', ano: '2023' },
    ],
    skills: ['Pacote Office', 'Comunicação', 'Trabalho em equipe', 'Organização', 'Pontualidade', 'Vontade de aprender', 'Redes sociais'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Básico' },
    ],
  },
  {
    cargo: 'Primeiro Emprego — Atendimento',
    resumo: 'Estudante dedicada em busca da primeira oportunidade profissional na área de atendimento. Possuo boa comunicação, facilidade em lidar com pessoas e disposição para aprender. Disponível para turnos flexíveis.',
    experiences: [
      {
        empresa: 'Feira do Livro Municipal',
        cargo: 'Auxiliar Voluntária',
        inicio: 'Jul 2024',
        fim: 'Jul 2024',
        atual: false,
        funcoes: [
          'Recepção e orientação de visitantes',
          'Organização de stands e materiais de divulgação',
        ],
      },
    ],
    education: [
      { curso: 'Ensino Médio Completo', instituicao: 'Colégio Estadual Dom Pedro II', ano: '2025' },
    ],
    courses: [
      { nome: 'Comunicação e Oratória', instituicao: 'Sebrae', ano: '2025' },
      { nome: 'Excel Básico', instituicao: 'Fundação Bradesco', ano: '2024' },
    ],
    skills: ['Comunicação', 'Atendimento ao público', 'Responsabilidade', 'Proatividade', 'Excel', 'Redes sociais', 'Adaptabilidade'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Espanhol', nivel: 'Básico' },
    ],
  },
  {
    cargo: 'Primeiro Emprego — Tecnologia',
    resumo: 'Estudante de tecnologia com conhecimentos em programação e grande interesse por desenvolvimento web. Projetos pessoais no GitHub demonstram capacidade de aprendizado autodidata. Busco primeira oportunidade como estagiário ou júnior.',
    experiences: [
      {
        empresa: 'Projeto Pessoal (GitHub)',
        cargo: 'Desenvolvedor — Projetos Acadêmicos',
        inicio: 'Jan 2024',
        fim: '',
        atual: true,
        funcoes: [
          'Criação de landing pages responsivas com HTML, CSS e JavaScript',
          'Desenvolvimento de aplicação de lista de tarefas com React',
          'Participação em hackathon universitário (2º lugar)',
        ],
      },
    ],
    education: [
      { curso: 'Análise e Desenvolvimento de Sistemas (cursando)', instituicao: 'FATEC', ano: '2026' },
    ],
    courses: [
      { nome: 'JavaScript Completo', instituicao: 'Udemy', ano: '2024' },
      { nome: 'Introdução ao React', instituicao: 'Rocketseat (NLW)', ano: '2024' },
      { nome: 'Git e GitHub', instituicao: 'DIO', ano: '2024' },
    ],
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Git', 'GitHub', 'Lógica de programação', 'Inglês técnico'],
    languages: [
      { idioma: 'Português', nivel: 'Nativo' },
      { idioma: 'Inglês', nivel: 'Intermediário' },
    ],
  },
];

// ─── PUBLIC API ───────────────────────────

const PROFILES = {
  administrativo: adminProfiles,
  tecnologia: techProfiles,
  vendas: salesProfiles,
  sem_experiencia: noExpProfiles,
};

const PROFILE_LABELS = {
  administrativo: '🏢 Administrativo',
  tecnologia: '💻 Tecnologia',
  vendas: '📊 Vendas',
  sem_experiencia: '🌱 Sem experiência',
};

export function getProfileLabels() {
  return PROFILE_LABELS;
}

export function generateSampleResume(profileType) {
  const profiles = PROFILES[profileType];
  if (!profiles) return null;

  const profile = pick(profiles);
  const nome = randomName();
  const cidade = pick(CIDADES);
  const telefone = pick(TELEFONES);

  return {
    nome,
    cargo: profile.cargo,
    email: nameToEmail(nome),
    telefone,
    endereco: cidade,
    linkedin: nameToLinkedin(nome),
    resumo: profile.resumo,
    experiences: profile.experiences.map(e => ({ ...e, funcoes: [...e.funcoes] })),
    education: profile.education.map(e => ({ ...e })),
    courses: profile.courses.map(c => ({ ...c })),
    skills: [...profile.skills],
    languages: profile.languages.map(l => ({ ...l })),
  };
}
