// Runtime job generator — mirrors the quality/patterns of the original 500 jobs

function slug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function logo(name) {
  return `/logos/${slug(name)}.png`;
}

const companies = [
  { name: 'Amazon Brasil', logo: logo('Amazon Brasil') },
  { name: 'Shopee Brasil', logo: logo('Shopee Brasil') },
  { name: 'Samsung Brasil', logo: logo('Samsung Brasil') },
  { name: 'Hotmart', logo: logo('Hotmart') },
  { name: 'Stone', logo: logo('Stone') },
  { name: 'RD Station', logo: logo('RD Station') },
  { name: 'Itaú', logo: logo('Itaú') },
  { name: 'Gympass', logo: logo('Gympass') },
  { name: 'TOTVS', logo: logo('TOTVS') },
  { name: 'Creditas', logo: logo('Creditas') },
  { name: 'BTG Pactual', logo: logo('BTG Pactual') },
  { name: 'Renner', logo: logo('Renner') },
  { name: 'QuintoAndar', logo: logo('QuintoAndar') },
  { name: 'PagSeguro', logo: logo('PagSeguro') },
  { name: 'Bradesco', logo: logo('Bradesco') },
  { name: 'Riachuelo', logo: logo('Riachuelo') },
  { name: 'CI&T', logo: logo('CI&T') },
  { name: 'Dafiti', logo: logo('Dafiti') },
  { name: 'Neon', logo: logo('Neon') },
  { name: 'Santander', logo: logo('Santander') },
  { name: 'PicPay', logo: logo('PicPay') },
  { name: 'C&A Brasil', logo: logo('C&A Brasil') },
  { name: 'iFood', logo: logo('iFood') },
  { name: '99', logo: logo('99') },
  { name: 'Rappi', logo: logo('Rappi') },
  { name: 'Americanas', logo: logo('Americanas') },
  { name: 'Nubank', logo: logo('Nubank') },
  { name: 'Locaweb', logo: logo('Locaweb') },
  { name: 'Dell Brasil', logo: logo('Dell Brasil') },
  { name: 'Claro', logo: logo('Claro') },
  { name: 'Carrefour', logo: logo('Carrefour') },
  { name: 'Movile', logo: logo('Movile') },
  { name: 'Netshoes', logo: logo('Netshoes') },
  { name: 'Magazine Luiza', logo: logo('Magazine Luiza') },
  { name: 'Mercado Livre', logo: logo('Mercado Livre') },
  { name: 'Natura', logo: logo('Natura') },
  { name: 'Vivo', logo: logo('Vivo') },
  { name: 'Tim', logo: logo('Tim') },
  // Fictional companies
  { name: 'Meta Solutions', logo: logo('Meta Solutions') },
  { name: 'Plena Gestão Empresarial', logo: logo('Plena Gestão Empresarial') },
  { name: 'Águia Logística', logo: logo('Águia Logística') },
  { name: 'Capital RH Consultoria', logo: logo('Capital RH Consultoria') },
  { name: 'Rede Comercial Atlas', logo: logo('Rede Comercial Atlas') },
  { name: 'Nova Era Consultoria', logo: logo('Nova Era Consultoria') },
  { name: 'Orbital Marketing', logo: logo('Orbital Marketing') },
  { name: 'Ideal Recursos Humanos', logo: logo('Ideal Recursos Humanos') },
  { name: 'Central Obras', logo: logo('Central Obras') },
  { name: 'Visão Digital', logo: logo('Visão Digital') },
  { name: 'Prime Serviços', logo: logo('Prime Serviços') },
  { name: 'TopLine Vendas', logo: logo('TopLine Vendas') },
  { name: 'DataBridge Analytics', logo: logo('DataBridge Analytics') },
  { name: 'TechNova Soluções', logo: logo('TechNova Soluções') },
  { name: 'VitaFarma', logo: logo('VitaFarma') },
  { name: 'Conecta Digital', logo: logo('Conecta Digital') },
  { name: 'Conecta Saúde', logo: logo('Conecta Saúde') },
  { name: 'Avance Tecnologia', logo: logo('Avance Tecnologia') },
  { name: 'Sol Nascente LTDA', logo: logo('Sol Nascente LTDA') },
  { name: 'Ágil Processos', logo: logo('Ágil Processos') },
  { name: 'Exata Contabilidade', logo: logo('Exata Contabilidade') },
  { name: 'Grupo Empresarial Vertex', logo: logo('Grupo Empresarial Vertex') },
  { name: 'Impacto Social', logo: logo('Impacto Social') },
  { name: 'Porto Seguro Digital', logo: logo('Porto Seguro Digital') },
  { name: 'Grupo Aliança', logo: logo('Grupo Aliança') },
];

const locations = [
  'Remoto', 'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
  'Curitiba, PR', 'Porto Alegre, RS', 'Salvador, BA', 'Brasília, DF',
  'Fortaleza, CE', 'Recife, PE', 'Florianópolis, SC', 'Goiânia, GO',
  'Campinas, SP', 'Manaus, AM', 'Belém, PA', 'Natal, RN', 'Vitória, ES',
  'Santos, SP', 'Joinville, SC', 'Maringá, PR', 'Londrina, PR',
  'Juiz de Fora, MG', 'Uberlândia, MG', 'São José dos Campos, SP',
  'Ribeirão Preto, SP', 'Campo Grande, MS', 'Cuiabá, MT', 'Teresina, PI',
  'João Pessoa, PB', 'Maceió, AL', 'São Luís, MA', 'Aracaju, SE',
  'Sorocaba, SP', 'Bauru, SP', 'Niterói, RJ', 'Piracicaba, SP',
];

const trainingBadges = [
  'Treinamento fornecido', 'Capacitação inclusa',
  'Treinamento inicial', 'Integração com treinamento',
];

const titlesByLevel = {
  'Sem experiência': [
    'Digitador de E-commerce', 'Digitador de Marketplace', 'Digitador de Produtos - Shopee',
    'Moderador de Redes Sociais', 'Moderador de Conteúdo', 'Curador de Conteúdo Digital',
    'Atendente via Chat - Home Office', 'Atendente de Chat Online', 'Suporte ao Cliente via Chat',
    'Operador de WhatsApp Business', 'Suporte via WhatsApp', 'Atendente de WhatsApp',
    'Auxiliar Administrativo', 'Assistente Administrativo', 'Auxiliar de Escritório',
    'Recepcionista', 'Recepcionista Comercial', 'Atendente de Recepção',
    'Operador de Caixa', 'Caixa de Loja', 'Atendente de Caixa',
    'Auxiliar de Logística', 'Auxiliar de Estoque', 'Estoquista',
    'Auxiliar de Almoxarifado', 'Repositor de Mercadorias', 'Assistente de Expedição',
    'Auxiliar de Produção', 'Operador de Produção', 'Auxiliar de Linha de Produção',
    'Operador de Planilhas', 'Auxiliar de Dados - Excel', 'Assistente de Organização de Dados',
    'Operador de Cadastro', 'Auxiliar de Cadastro Digital', 'Assistente de Cadastro Online',
    'Transcrevedor de Áudio', 'Transcritor Freelancer', 'Digitador de Transcrição',
    'Avaliador de Qualidade - E-commerce', 'Avaliador de Produtos Online', 'Revisor de Anúncios',
    'Pesquisador Digital', 'Auxiliar de Pesquisas Online', 'Assistente de Pesquisa de Mercado',
    'Jovem Aprendiz Administrativo', 'Menor Aprendiz', 'Aprendiz - Área Administrativa',
    'Atendente de Call Center', 'Operador de SAC', 'Suporte a Vendas Digital',
    'Vendedor(a) de Loja', 'Atendente de Loja', 'Consultor(a) de Vendas - Varejo',
    'Assistente de Vendas Online', 'Auxiliar de E-commerce', 'Assistente de Atendimento ao Cliente',
    'Porteiro', 'Controlador de Acesso', 'Vigilante Patrimonial',
    'Auxiliar de Limpeza', 'Auxiliar de Serviços Gerais', 'Colaborador de Limpeza e Conservação',
    'Ajudante de Cozinha', 'Auxiliar de Cozinha', 'Auxiliar de Copa',
  ],
  'Júnior': [
    'Designer Visual', 'Designer Gráfico Júnior', 'Assistente de Design',
    'Analista de Suporte Júnior', 'Suporte Técnico N1', 'Técnico de Helpdesk',
    'Assistente Financeiro', 'Auxiliar Financeiro', 'Analista Financeiro Júnior',
    'Analista de Dados Júnior', 'Assistente de BI', 'Analista de Inteligência de Dados Jr.',
    'Assistente Comercial', 'Consultor de Vendas Interno', 'SDR - Pré-Vendas',
    'Desenvolvedor Web Júnior', 'Dev Júnior - Web', 'Programador Frontend Jr.',
    'Social Media', 'Assistente de Redes Sociais', 'Analista de Mídias Sociais Júnior',
    'Assistente de Marketing', 'Analista de Marketing Jr.', 'Assistente de Comunicação',
    'Assistente de RH', 'Assistente de Departamento Pessoal', 'Assistente de Processos',
    'Analista de Operações Jr.', 'Analista Administrativo Júnior',
  ],
  'Pleno': [
    'Coordenador Administrativo', 'Analista de Processos Pleno', 'Analista Contábil',
    'Enfermeiro(a) Assistencial', 'Enfermeiro(a) do Trabalho', 'Enfermeiro(a)',
    'Analista de Dados Pleno', 'Cientista de Dados', 'Data Analyst',
    'Engenheiro de Software', 'Desenvolvedor Backend', 'Desenvolvedor Full Stack',
    'Especialista Fiscal', 'Contador Pleno', 'Especialista em Performance',
    'Growth Marketing', 'Analista de Marketing Digital', 'Product Designer',
    'UX/UI Designer', 'Designer de Produto Digital',
  ],
  'Sênior': [
    'Head de Finanças', 'CFO', 'Diretor Financeiro',
    'Tech Lead', 'Principal Engineer', 'Staff Engineer',
    'Engenheiro de Software Sênior', 'Gerente de Projetos Sênior', 'PMO',
    'HRBP Sênior', 'Gerente de RH', 'Head de Pessoas',
    'Especialista em Tráfego Pago', 'Head de Projetos',
  ],
};

const categoryMap = [
  { kw: ['digitador','cadastro','planilha','excel','dados','transcrição','transcritor','transcrevedor'], cat: 'Administrativo' },
  { kw: ['atendente','chat','whatsapp','sac','call center','suporte ao cliente','atendimento'], cat: 'Atendimento' },
  { kw: ['desenvolvedor','dev ','frontend','backend','full stack','engenheiro de software','tech lead','principal engineer','staff engineer','programador','helpdesk','suporte técnico'], cat: 'Tecnologia' },
  { kw: ['marketing','social media','mídias sociais','designer','ux','ui','growth','tráfego','comunicação','conteúdo','moderador','curador','product designer'], cat: 'Marketing' },
  { kw: ['financeiro','contábil','contador','fiscal','cfo','finanças'], cat: 'Financeiro' },
  { kw: ['vendas','comercial','vendedor','sdr','pré-vendas','consultor'], cat: 'Vendas' },
  { kw: ['logística','estoque','almoxarifado','expedição','repositor'], cat: 'Logística' },
  { kw: ['enfermeiro','saúde','farma'], cat: 'Saúde' },
  { kw: ['limpeza','serviços gerais','cozinha','copa','porteiro','vigilante','controlador de acesso','conservação'], cat: 'Serviços Gerais' },
  { kw: ['rh','recursos humanos','departamento pessoal','hrbp','pessoas','processos','administrativo','operações','aprendiz','recepcionista','caixa','operador de caixa','auxiliar administrativo','assistente administrativo','escritório','pesquisa','avaliador','revisor'], cat: 'Administrativo' },
];

function getCategory(title) {
  const t = title.toLowerCase();
  for (const { kw, cat } of categoryMap) {
    if (kw.some(k => t.includes(k))) return cat;
  }
  return ['Administrativo', 'Atendimento', 'Vendas'][Math.floor(Math.random() * 3)];
}

const descTemplates = {
  'Sem experiência': [
    (t, c) => `Atuar como ${t} na ${c}. Responsável por executar atividades operacionais da área com atenção a detalhes e organização. Não é necessário experiência prévia.`,
    (t, c) => `Vaga para ${t} na ${c}. O profissional irá realizar tarefas do dia a dia com suporte da equipe. Disponibilidade para início imediato.`,
    (t, c) => `Oportunidade para ${t} na ${c}. Atividades incluem apoio operacional, organização de informações e atendimento básico. Treinamento será oferecido.`,
    (t, c) => `A ${c} busca ${t} para integrar a equipe. Atuação em rotinas diárias com acompanhamento de supervisão. Ideal para quem busca primeiro emprego.`,
    (t, c) => `Vaga de ${t} na ${c}. Fará parte de uma equipe colaborativa, realizando tarefas práticas com orientação completa. Ambiente acolhedor e oportunidade de crescimento.`,
  ],
  'Sem experiência informal': [
    (t, c) => `Vaga de ${t} na ${c}. Trabalho autônomo, sem vínculo CLT. Flexibilidade de horário e possibilidade de atuação remota. Treinamento incluso.`,
    (t, c) => `Oportunidade de ${t} na ${c}. Atuação como prestador de serviço, sem vínculo empregatício. Pagamento mensal fixo. Capacitação fornecida pela empresa.`,
    (t, c) => `A ${c} busca ${t} para trabalho autônomo. Sem necessidade de experiência prévia. A empresa oferece treinamento inicial completo para capacitação do profissional.`,
    (t, c) => `Posição de ${t} na ${c}. Prestação de serviço autônomo com remuneração fixa mensal. Não é necessário experiência, capacitação será fornecida no início.`,
  ],
  'Júnior': [
    (t, c) => `Vaga de ${t} na ${c}. Atuação em projetos da área com suporte de profissionais seniores. Requer conhecimentos básicos e vontade de aprender. Benefícios competitivos.`,
    (t, c) => `A ${c} contrata ${t}. Responsável por auxiliar em demandas técnicas e operacionais. Experiência de 6 meses a 1 ano é desejável. Ambiente de crescimento.`,
    (t, c) => `Oportunidade para ${t} na ${c}. Participar de projetos em equipe, contribuindo com análises e entregas do dia a dia. Plano de carreira estruturado.`,
    (t, c) => `${t} na ${c}. Buscamos profissional em início de carreira para atuar com a equipe em demandas do setor. Formação na área é um diferencial.`,
  ],
  'Pleno': [
    (t, c) => `Posição de ${t} na ${c}. Atuação com autonomia em projetos estratégicos, liderança técnica e interface com diversas áreas. Experiência de 3+ anos necessária.`,
    (t, c) => `A ${c} busca ${t} para fortalecer a equipe. Responsável por entregas de alta qualidade, mentoria de juniores e definição de processos. Salário e benefícios atrativos.`,
    (t, c) => `Vaga de ${t} na ${c}. Profissional com experiência consolidada para atuar em demandas complexas, propor melhorias e garantir resultados. Ambiente desafiador.`,
    (t, c) => `${t} na ${c}. Atuação em projetos de média e alta complexidade com responsabilidade sobre entregas e prazos. Experiência comprovada na área é essencial.`,
  ],
  'Sênior': [
    (t, c) => `Posição sênior de ${t} na ${c}. Liderança estratégica, tomada de decisão e influência direta nos resultados do negócio. Experiência de 5+ anos obrigatória.`,
    (t, c) => `A ${c} busca ${t} para posição de liderança. Atuação com visão executiva, gestão de equipes e alinhamento com objetivos corporativos. Remuneração diferenciada.`,
    (t, c) => `Oportunidade sênior na ${c} para ${t}. Definir estratégias, gerenciar times e impulsionar inovação. Perfil analítico e experiência comprovada são essenciais.`,
  ],
};

function genSalary(level, informal) {
  if (informal) {
    const v = pick([1000, 1050, 1100, 1150, 1200, 1250, 1300]);
    return fmt(v);
  }
  const ranges = {
    'Sem experiência': [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000],
    'Júnior': [2000, 2200, 2400, 2600, 2800, 3000, 3200, 3300, 3500, 3600, 3800, 4000],
    'Pleno': [4000, 4100, 4200, 4500, 5000, 5300, 5500, 6000, 6100, 6500, 7000, 7500, 8000],
    'Sênior': [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11400, 12000, 12300, 13000, 13600, 14000, 14800, 15000],
  };
  return fmt(pick(ranges[level] || ranges['Sem experiência']));
}

function fmt(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genHours(workType) {
  return workType === 'Home Office'
    ? pick(['4 horas/dia', '5 horas/dia', '6 horas/dia'])
    : pick(['6 horas/dia', '7 horas/dia', '8 horas/dia']);
}

/**
 * Generate N realistic jobs with correct proportions.
 * @param {number} count
 * @param {number} startId
 * @returns {Array}
 */
export function generateJobs(count, startId = 1) {
  const semExpCount = Math.round(count * 0.6);
  const informalCount = Math.round(semExpCount * 0.5);
  const cltSemExpCount = semExpCount - informalCount;
  const juniorCount = Math.round(count * 0.2);
  const plenoCount = Math.round(count * 0.14);
  const seniorCount = Math.max(1, count - semExpCount - juniorCount - plenoCount);

  const hoTarget = Math.round(count * 0.7);
  const jobs = [];
  let id = startId;
  let hoUsed = 0;

  function shouldBeHO() {
    const remaining = count - jobs.length;
    const hoRemaining = hoTarget - hoUsed;
    if (hoRemaining <= 0) return false;
    if (hoRemaining >= remaining) return true;
    return Math.random() < (hoRemaining / remaining);
  }

  function createJob(level, informal = false) {
    const title = pick(titlesByLevel[level]);
    const company = pick(companies);
    const isHO = shouldBeHO();
    const workType = isHO ? 'Home Office' : pick(['Presencial', 'Híbrido']);
    if (isHO) hoUsed++;
    const location = isHO ? 'Remoto' : pick(locations.filter(l => l !== 'Remoto'));
    const category = getCategory(title);
    const salary = genSalary(level, informal);
    const cargaHoraria = genHours(workType);
    const descKey = informal ? 'Sem experiência informal' : level;
    const desc = pick(descTemplates[descKey])(title, company.name);
    const badges = [workType, level, category];
    if (informal) badges.push('Autônomo');
    if (level === 'Sem experiência' && Math.random() < 0.6) {
      badges.push(pick(trainingBadges));
    }

    jobs.push({
      id: id++, title, company: company.name, logo: company.logo,
      location, description: desc, category, workType, level,
      salary, cargaHoraria, badges, informal,
      status: 'ativa', createdAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < informalCount; i++) createJob('Sem experiência', true);
  for (let i = 0; i < cltSemExpCount; i++) createJob('Sem experiência', false);
  for (let i = 0; i < juniorCount; i++) createJob('Júnior');
  for (let i = 0; i < plenoCount; i++) createJob('Pleno');
  for (let i = 0; i < seniorCount; i++) createJob('Sênior');

  // Shuffle
  for (let i = jobs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [jobs[i], jobs[j]] = [jobs[j], jobs[i]];
  }

  return jobs;
}
