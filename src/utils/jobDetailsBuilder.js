// jobDetailsBuilder.js
// Gera estrutura completa de detalhes de vaga (8 seções) a partir dos campos básicos.
// Determinístico: mesma vaga sempre gera o mesmo conteúdo (usa o id como semente).
// Mantém a essência original da vaga, apenas enriquece a apresentação.

const seeded = (id, max) => {
  const h = ((Number(id) || 1) * 2654435761) >>> 0;
  return h % max;
};

// ---------- 1. Sobre a empresa ----------
const COMPANY_SECTORS = {
  'Marketing': 'comunicação digital, branding e performance',
  'Atendimento': 'experiência do cliente e relacionamento',
  'Administrativo': 'gestão administrativa e processos corporativos',
  'Saúde': 'saúde, bem-estar e cuidado ao paciente',
  'Tecnologia': 'tecnologia, dados e transformação digital',
  'Financeiro': 'soluções financeiras e gestão contábil',
  'Vendas': 'vendas, expansão comercial e relacionamento com clientes',
  'Logística': 'logística, transporte e cadeia de suprimentos',
  'Serviços Gerais': 'serviços operacionais e infraestrutura',
  'Construção': 'engenharia, obras e infraestrutura',
  'Outros': 'soluções corporativas',
};

const COMPANY_SIZES = [
  'mais de 1.500 colaboradores em todo o Brasil',
  'mais de 800 colaboradores e atuação nacional',
  'equipes multidisciplinares em diversas regiões do país',
  'unidades em diferentes estados brasileiros',
  'mais de 10 anos de mercado',
  'mais de 15 anos de atuação consolidada',
];

function buildSobreEmpresa(job) {
  const setor = COMPANY_SECTORS[job.category] || 'soluções corporativas';
  const size = COMPANY_SIZES[seeded(job.id + 7, COMPANY_SIZES.length)];
  return `A ${job.company} é uma empresa que atua no segmento de ${setor}, com ${size}. ` +
    `Reconhecida por valorizar o desenvolvimento profissional e oferecer um ambiente de trabalho colaborativo, ` +
    `está expandindo suas equipes e busca novos talentos comprometidos com qualidade, organização e bons resultados.`;
}

// ---------- 2. Descrição (já existe) - usamos a original e expandimos ----------
function buildDescricao(job) {
  const base = (job.description || '').trim();
  const compl = job.workType === 'Home Office'
    ? 'A função pode ser realizada de forma remota, com acompanhamento regular da equipe e ferramentas de comunicação fornecidas pela empresa.'
    : job.workType === 'Híbrido'
      ? 'A rotina combina dias no escritório e atividades remotas, conforme a demanda do setor.'
      : 'A atuação será presencial na unidade da empresa, em ambiente estruturado e com toda a infraestrutura necessária.';
  return `${base} ${compl}`;
}

// ---------- 3. Atividades ----------
// Templates por palavra-chave do título (mais específico) — caem no template de categoria se nada bater.

const TITLE_KEYWORDS = [
  { match: /digitador|cadastrador/i, atividades: [
    'Realizar cadastros de produtos, clientes ou informações em sistemas internos',
    'Conferir dados antes de inserir nas planilhas e plataformas',
    'Atualizar registros e corrigir inconsistências quando necessário',
    'Organizar arquivos digitais por categoria e prioridade',
    'Reportar pendências e divergências para o supervisor responsável',
    'Manter o sigilo das informações tratadas durante a rotina',
    'Acompanhar metas diárias de digitação definidas pela equipe',
  ]},
  { match: /recepcionista/i, atividades: [
    'Recepcionar clientes, fornecedores e visitantes com cordialidade',
    'Atender ligações telefônicas e direcionar aos setores corretos',
    'Controlar a entrada e saída de pessoas, registrando em planilha ou sistema',
    'Agendar reuniões, salas e compromissos da equipe',
    'Receber e despachar correspondências e encomendas',
    'Manter o ambiente da recepção organizado e apresentável',
    'Apoiar a área administrativa em pequenas demandas do dia a dia',
  ]},
  { match: /assistente administrativ/i, atividades: [
    'Auxiliar nas rotinas administrativas do setor',
    'Organizar documentos físicos e digitais, mantendo o arquivo atualizado',
    'Lançar informações em planilhas e sistemas internos',
    'Apoiar na emissão de notas, relatórios e controles internos',
    'Atender chamadas, e-mails e solicitações de outros departamentos',
    'Acompanhar prazos e cobrar pendências quando necessário',
    'Realizar conferências e fechamentos diários do setor',
  ]},
  { match: /vendedor|consultor de vendas|representante/i, atividades: [
    'Atender clientes com foco em entender suas necessidades',
    'Apresentar produtos ou serviços de forma clara e consultiva',
    'Realizar prospecção ativa de novos clientes',
    'Negociar valores, condições e prazos respeitando a política comercial',
    'Acompanhar o pós-venda e manter o relacionamento ativo',
    'Registrar oportunidades e atualizações no CRM ou sistema interno',
    'Cumprir as metas mensais definidas pela liderança comercial',
  ]},
  { match: /atendente|sac|atendimento ao cliente/i, atividades: [
    'Atender clientes por telefone, chat ou e-mail com agilidade',
    'Identificar a necessidade do contato e oferecer a melhor solução',
    'Registrar o atendimento em sistema, com clareza e detalhamento',
    'Encaminhar demandas para outros setores quando necessário',
    'Acompanhar a resolução até o retorno final ao cliente',
    'Cumprir os indicadores de qualidade e tempo médio de atendimento',
    'Manter postura cordial mesmo em situações de pressão',
  ]},
  { match: /designer/i, atividades: [
    'Criar peças gráficas para redes sociais, e-mail e materiais internos',
    'Adaptar artes para diferentes formatos e plataformas',
    'Aplicar identidade visual da marca em todos os materiais produzidos',
    'Participar de briefings e propor soluções criativas',
    'Organizar e versionar arquivos para entrega final',
    'Acompanhar prazos e revisões com a equipe de marketing',
    'Manter-se atualizado com tendências de design',
  ]},
  { match: /enfermeir|t[eé]cnico em enfermagem|auxiliar de enfermagem/i, atividades: [
    'Realizar procedimentos de enfermagem conforme prescrição',
    'Acolher pacientes e familiares com humanização',
    'Verificar sinais vitais e registrar em prontuário',
    'Auxiliar a equipe médica em consultas e procedimentos',
    'Organizar materiais, instrumentais e medicações',
    'Cumprir os protocolos de biossegurança da unidade',
    'Manter os registros assistenciais sempre atualizados',
  ]},
  { match: /motorista|entregador/i, atividades: [
    'Realizar entregas dentro das rotas definidas pela equipe',
    'Conferir cargas, notas fiscais e documentos antes de sair',
    'Cumprir os prazos estabelecidos para cada coleta ou entrega',
    'Zelar pela conservação do veículo e equipamentos',
    'Reportar ocorrências, atrasos ou avarias ao responsável',
    'Atender clientes com cordialidade no momento da entrega',
    'Manter a CNH e documentos do veículo sempre regularizados',
  ]},
  { match: /aux.*log[ií]stic|estoq|almoxarif/i, atividades: [
    'Receber, conferir e armazenar mercadorias no estoque',
    'Realizar separação e expedição de pedidos',
    'Manter o controle de inventário com precisão',
    'Organizar o almoxarifado por categorias e prioridades',
    'Operar sistemas de gestão de estoque (WMS ou ERP)',
    'Identificar divergências e reportar à liderança',
    'Apoiar a equipe em conferências mensais de inventário',
  ]},
  { match: /servi[cç]os gerais|limpeza|aux.*limpeza|copeir|zelador/i, atividades: [
    'Realizar a limpeza e organização das áreas internas e comuns',
    'Repor materiais de higiene nos banheiros e copas',
    'Coletar e descartar resíduos seguindo as normas internas',
    'Comunicar pequenos reparos e necessidades de manutenção',
    'Apoiar a equipe na arrumação de salas e ambientes',
    'Utilizar EPIs e produtos de limpeza de forma segura',
    'Manter os materiais de trabalho sempre organizados',
  ]},
  { match: /financeir|contas a pagar|contas a receber|tesouraria/i, atividades: [
    'Apoiar a área financeira nas rotinas de contas a pagar e receber',
    'Conciliar extratos bancários e movimentações',
    'Emitir boletos, notas fiscais e relatórios financeiros',
    'Controlar o fluxo de caixa diário do setor',
    'Cobrar clientes inadimplentes seguindo o protocolo da empresa',
    'Apoiar nos fechamentos mensais junto à contabilidade',
    'Organizar documentos fiscais e contábeis para auditoria',
  ]},
  { match: /anal.*dados|analista de dados|business intelligence|bi/i, atividades: [
    'Coletar, tratar e organizar dados de diferentes fontes',
    'Construir dashboards e relatórios em Power BI, Tableau ou similar',
    'Gerar insights para apoiar decisões da liderança',
    'Validar a integridade dos dados e identificar inconsistências',
    'Participar de reuniões com áreas de negócio para entender demandas',
    'Documentar processos e queries criadas',
    'Sugerir melhorias em processos baseado em análises',
  ]},
  { match: /suporte t[eé]cnico|help ?desk|t[eé]cnico de inform[aá]tica/i, atividades: [
    'Atender chamados de suporte técnico de usuários internos',
    'Diagnosticar e resolver problemas em hardware e software',
    'Configurar estações de trabalho, e-mails e periféricos',
    'Registrar atendimentos em sistema de tickets',
    'Apoiar a área de TI em manutenções programadas',
    'Orientar usuários sobre boas práticas de uso',
    'Escalar incidentes mais complexos para o nível responsável',
  ]},
  { match: /moderador|avaliador.*qualidade|cura(?:dor|doria)/i, atividades: [
    'Avaliar conteúdos e publicações conforme as diretrizes da plataforma',
    'Aprovar ou recusar materiais com base nos critérios definidos',
    'Identificar conteúdos suspeitos ou fora do padrão',
    'Registrar avaliações no sistema com clareza',
    'Sugerir ajustes nas políticas quando perceber padrões recorrentes',
    'Manter sigilo total sobre os dados acessados',
    'Cumprir as metas diárias de avaliação',
  ]},
  { match: /produ[cç][aã]o|operador de m[aá]quina|industri/i, atividades: [
    'Operar máquinas e equipamentos da linha de produção',
    'Acompanhar indicadores de produtividade e qualidade',
    'Realizar inspeções visuais e pequenos ajustes',
    'Comunicar paradas, falhas e necessidades de manutenção',
    'Cumprir as normas de segurança e uso de EPIs',
    'Manter o posto de trabalho limpo e organizado',
    'Apoiar a equipe em trocas de turno e passagens de informação',
  ]},
  { match: /coordenador|supervisor|gerente|l[ií]der/i, atividades: [
    'Liderar a equipe na execução das rotinas do setor',
    'Acompanhar indicadores e resultados, propondo melhorias',
    'Organizar escalas, prioridades e distribuição de tarefas',
    'Conduzir reuniões periódicas e feedbacks individuais',
    'Garantir o cumprimento de prazos e padrões de qualidade',
    'Reportar à diretoria os principais resultados do período',
    'Atuar no desenvolvimento e capacitação contínua dos colaboradores',
  ]},
  { match: /marketing|social media|m[ií]dia/i, atividades: [
    'Apoiar na execução do calendário editorial e campanhas',
    'Produzir e revisar conteúdos para redes sociais',
    'Acompanhar métricas de engajamento e alcance',
    'Interagir com o público nos comentários e mensagens',
    'Organizar materiais para campanhas de e-mail marketing',
    'Pesquisar referências e tendências do segmento',
    'Apoiar a equipe em ações pontuais de divulgação',
  ]},
  { match: /recurs.*humanos|departamento pessoal|rh|dp/i, atividades: [
    'Apoiar nas rotinas de departamento pessoal e admissões',
    'Organizar documentações trabalhistas e prontuários',
    'Acompanhar pontos, faltas, férias e desligamentos',
    'Apoiar processos seletivos com triagem de currículos',
    'Atender colaboradores em dúvidas sobre benefícios',
    'Apoiar treinamentos e ações de integração',
    'Manter as informações dos colaboradores sempre atualizadas',
  ]},
  { match: /caixa|operador de caixa/i, atividades: [
    'Realizar abertura e fechamento de caixa diário',
    'Operar o sistema de pagamentos (dinheiro, cartão, Pix)',
    'Atender clientes com agilidade e cordialidade',
    'Conferir cédulas, troco e fechamento ao final do turno',
    'Apoiar na organização do checkout',
    'Resolver pequenas divergências de valores junto à liderança',
    'Cumprir as normas internas de segurança financeira',
  ]},
  { match: /repositor|empacotador/i, atividades: [
    'Repor produtos nas prateleiras conforme planograma',
    'Conferir validades e organizar mercadorias por categoria',
    'Auxiliar clientes com dúvidas sobre produtos',
    'Comunicar a liderança sobre rupturas de estoque',
    'Manter as gôndolas e o setor sempre limpos',
    'Apoiar em conferências de carga e recebimentos',
    'Trabalhar em equipe respeitando os horários de turno',
  ]},
];

const CATEGORY_FALLBACK_ATIVIDADES = {
  'Marketing': [
    'Apoiar na execução de campanhas e ações de marketing',
    'Produzir, revisar e adaptar conteúdos para diferentes canais',
    'Acompanhar métricas e gerar relatórios de desempenho',
    'Pesquisar referências, tendências e concorrentes',
    'Apoiar a equipe em demandas pontuais de divulgação',
    'Organizar arquivos, briefings e materiais visuais',
    'Garantir a aplicação correta da identidade da marca',
  ],
  'Atendimento': [
    'Realizar atendimento humanizado a clientes',
    'Registrar interações em sistema com clareza',
    'Direcionar demandas para os setores responsáveis',
    'Acompanhar resoluções até o retorno ao cliente',
    'Cumprir indicadores de qualidade do atendimento',
    'Apoiar a equipe em demandas pontuais',
    'Sugerir melhorias na experiência do cliente',
  ],
  'Administrativo': [
    'Apoiar as rotinas administrativas do setor',
    'Organizar documentos físicos e digitais',
    'Lançar dados em planilhas e sistemas internos',
    'Apoiar na emissão de relatórios e controles',
    'Atender solicitações de outras áreas',
    'Acompanhar prazos e pendências',
    'Garantir a organização do arquivo da equipe',
  ],
  'Saúde': [
    'Acolher pacientes com humanização',
    'Apoiar nos procedimentos da rotina assistencial',
    'Manter os ambientes organizados e higienizados',
    'Cumprir os protocolos de biossegurança',
    'Registrar atendimentos em prontuário',
    'Trabalhar em equipe com a área médica',
    'Cuidar da reposição e organização de materiais',
  ],
  'Tecnologia': [
    'Apoiar nas rotinas técnicas do setor',
    'Documentar processos, soluções e atendimentos',
    'Atuar em parceria com outras áreas em projetos',
    'Buscar continuamente conhecimento técnico',
    'Manter os ambientes e ferramentas organizados',
    'Reportar incidentes e propor melhorias',
    'Cumprir os padrões de segurança da informação',
  ],
  'Financeiro': [
    'Apoiar nas rotinas financeiras do setor',
    'Conciliar lançamentos e movimentações bancárias',
    'Emitir relatórios e controles internos',
    'Controlar prazos de pagamentos e recebimentos',
    'Apoiar nos fechamentos mensais',
    'Organizar a documentação fiscal',
    'Garantir a precisão das informações lançadas',
  ],
  'Vendas': [
    'Atender clientes com foco em conversão',
    'Apresentar produtos e serviços de forma consultiva',
    'Negociar valores e condições',
    'Acompanhar o pós-venda',
    'Registrar oportunidades em sistema',
    'Cumprir as metas comerciais',
    'Apoiar a equipe em ações pontuais',
  ],
  'Logística': [
    'Apoiar nas rotinas de movimentação e estocagem',
    'Conferir mercadorias na entrada e saída',
    'Organizar o setor por categorias e prioridades',
    'Operar sistemas de gestão de estoque',
    'Apoiar conferências e inventários',
    'Reportar divergências à liderança',
    'Cumprir os padrões de segurança operacional',
  ],
  'Serviços Gerais': [
    'Realizar atividades de limpeza e conservação',
    'Repor materiais nos ambientes da empresa',
    'Apoiar pequenas tarefas operacionais',
    'Comunicar necessidades de manutenção',
    'Utilizar EPIs e produtos de forma segura',
    'Manter os equipamentos organizados',
    'Apoiar a equipe em demandas do dia a dia',
  ],
  'Construção': [
    'Apoiar nas atividades operacionais da obra',
    'Cumprir os padrões de segurança do canteiro',
    'Utilizar EPIs corretamente em todas as etapas',
    'Apoiar pedreiros, mestres e encarregados',
    'Organizar materiais e ferramentas',
    'Reportar ocorrências e necessidades',
    'Trabalhar em equipe respeitando o cronograma',
  ],
  'Outros': [
    'Apoiar a equipe nas rotinas do setor',
    'Organizar atividades, documentos e fluxos',
    'Atuar em parceria com outras áreas',
    'Reportar pendências à liderança',
    'Cumprir os padrões internos da empresa',
    'Manter o ambiente de trabalho organizado',
    'Buscar evolução contínua na função',
  ],
};

function buildAtividades(job) {
  const t = job.title || '';
  for (const k of TITLE_KEYWORDS) {
    if (k.match.test(t)) return k.atividades;
  }
  return CATEGORY_FALLBACK_ATIVIDADES[job.category] || CATEGORY_FALLBACK_ATIVIDADES['Outros'];
}

// ---------- 4. Requisitos ----------
function buildRequisitos(job) {
  const escolaridadeMap = {
    'Não exigida': 'Escolaridade não exigida',
    'Ensino Fundamental': 'Ensino Fundamental completo',
    'Ensino Médio': 'Ensino Médio completo',
    'Ensino Técnico': 'Ensino Técnico na área',
    'Ensino Superior': 'Ensino Superior em curso ou concluído',
    'Pós-graduação': 'Pós-graduação na área',
  };
  const esc = escolaridadeMap[job.escolaridade] || 'Ensino Médio completo (preferencialmente)';

  const expByLevel = {
    'Sem experiência': 'Não é necessário ter experiência prévia — treinamento incluso no início',
    'Júnior': 'Experiência mínima de 6 meses na função (desejável, não eliminatória)',
    'Pleno': 'Experiência de 2 a 4 anos comprovados na função',
    'Sênior': 'Experiência sólida de 5 anos ou mais na função, com vivência em liderança',
  };
  const exp = expByLevel[job.level] || expByLevel['Sem experiência'];

  const baseHabilidades = [
    'Boa comunicação verbal e escrita',
    'Organização e atenção aos detalhes',
    'Comprometimento, pontualidade e responsabilidade',
    'Facilidade para trabalhar em equipe',
  ];

  const techByCat = {
    'Tecnologia': 'Conhecimento básico em informática e raciocínio lógico',
    'Marketing': 'Familiaridade com redes sociais e ferramentas digitais',
    'Financeiro': 'Conhecimento em Excel e noções de matemática financeira',
    'Administrativo': 'Domínio básico do pacote Office (Word, Excel, e-mail)',
    'Atendimento': 'Boa dicção e paciência no atendimento ao público',
    'Vendas': 'Perfil comunicativo e foco em resultados',
    'Logística': 'Atenção, organização e disposição para rotina ativa',
    'Saúde': 'Postura ética, sigilo e atendimento humanizado',
    'Serviços Gerais': 'Disposição física e atenção às normas de segurança',
    'Construção': 'Disposição para trabalhar em obra e respeitar normas de segurança',
  };
  const techReq = techByCat[job.category];

  const reqs = [esc, exp, ...baseHabilidades];
  if (techReq) reqs.push(techReq);
  if (job.workType === 'Home Office') reqs.push('Internet estável e ambiente adequado para trabalho remoto');
  if (job.workType === 'Híbrido') reqs.push('Disponibilidade para alternar entre dias presenciais e remotos');
  return reqs;
}

// ---------- 5. Remuneração e benefícios ----------
function buildBeneficios(job) {
  const beneficios = [];
  if (job.salary) beneficios.push(`Salário de ${job.salary}`);
  if (job.informal) {
    beneficios.push('Pagamento mensal via PIX, transferência ou boleto');
    beneficios.push('Flexibilidade total de horário (autônomo)');
    beneficios.push('Material de apoio e treinamento iniciais inclusos');
    beneficios.push('Possibilidade de trabalhar de qualquer lugar (remoto)');
  } else {
    beneficios.push('Vale-transporte ou ajuda de custo equivalente');
    beneficios.push('Vale-alimentação ou vale-refeição');
    beneficios.push('Plano de saúde após período de experiência (conforme política da empresa)');
    beneficios.push('Treinamento inicial pago pela empresa');
    beneficios.push('Bonificação por desempenho e metas atingidas');
  }
  beneficios.push('Suporte direto da equipe e liderança durante toda a jornada');
  return beneficios;
}

// ---------- 6. Crescimento ----------
function buildCrescimento(job) {
  const map = {
    'Sem experiência': 'Plano de carreira interno: após o período inicial, há possibilidade de evolução para funções júnior, com aumento de remuneração e responsabilidades.',
    'Júnior': 'Possibilidade de promoção para níveis pleno e sênior conforme desempenho, participação em treinamentos internos e novos projetos da empresa.',
    'Pleno': 'Trilha de desenvolvimento para posições de coordenação e liderança, com acesso a treinamentos avançados e participação em projetos estratégicos.',
    'Sênior': 'Oportunidade de assumir liderança de projetos, gestão de equipe e participação em decisões estratégicas da área.',
  };
  return map[job.level] || map['Sem experiência'];
}

// ---------- 7. Jornada ----------
function buildJornada(job) {
  const horas = job.cargaHoraria || '6 horas/dia';
  const turnos = [
    'das 08h às 14h',
    'das 09h às 15h',
    'das 13h às 19h',
    'das 14h às 20h',
    'horário flexível, combinado com a liderança',
  ];
  const turno = job.informal
    ? 'horário flexível — você define quando trabalhar dentro da meta diária'
    : turnos[seeded(job.id, turnos.length)];
  const dias = job.informal ? 'Sem dias fixos (autônomo)' : 'De segunda a sexta-feira (sábados eventuais conforme escala)';
  return { horas, turno, dias };
}

// ---------- 8. Informações adicionais ----------
function buildInfoAdicionais(job) {
  const tipoContrato = job.informal
    ? 'Trabalho autônomo (sem vínculo CLT) — recebimento por produção/mensal'
    : 'Contrato CLT com todos os direitos trabalhistas garantidos';
  const numVagas = (seeded(job.id + 13, 8) + 1); // 1 a 8 vagas
  return {
    tipoContrato,
    inicio: 'Início imediato após aprovação no processo seletivo',
    numVagas,
    processo: 'Processo simples: candidatura via plataforma → análise do currículo → contato da empresa por e-mail ou telefone.',
  };
}

// ---------- Tags computadas (para o card e painel) ----------
export function buildJobTags(job) {
  const tags = [];
  if (job.level === 'Sem experiência') tags.push('Sem experiência');
  // Treinamento incluso para sem-experiência ou quando description menciona treinamento
  if (job.level === 'Sem experiência' || /treinamento|capacita[cç][aã]o|integra[cç][aã]o/i.test(job.description || '') || (job.badges || []).some(b => /treinamento|capacita/i.test(b))) {
    tags.push('Treinamento incluso');
  }
  tags.push('Início imediato');
  return tags;
}

// ---------- Prova social ----------
export function getApplicantsToday(jobId) {
  // determinístico por dia + jobId
  const d = new Date();
  const day = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const h = ((Number(jobId) || 1) * 2654435761 + day * 17) >>> 0;
  return (h % 38) + 12; // 12 a 49 candidaturas hoje
}

export function getHighDemand(jobId) {
  return seeded(jobId + 3, 100) > 55; // ~45% das vagas marcadas como alta procura
}

// ---------- Builder principal ----------
export function buildJobDetails(job) {
  if (!job) return null;
  return {
    sobreEmpresa: buildSobreEmpresa(job),
    descricao: buildDescricao(job),
    atividades: buildAtividades(job),
    requisitos: buildRequisitos(job),
    beneficios: buildBeneficios(job),
    crescimento: buildCrescimento(job),
    jornada: buildJornada(job),
    infoAdicionais: buildInfoAdicionais(job),
    tags: buildJobTags(job),
    applicantsToday: getApplicantsToday(job.id),
    highDemand: getHighDemand(job.id),
  };
}
