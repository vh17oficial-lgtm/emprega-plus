import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { initialJobs, initialLandingTexts } from '../data/mockData';
import { defaultSendPlans, defaultAutoDispatchConfig, defaultUpsellTexts } from '../data/plansData';
import { defaultSiteConfig, defaultRotationConfig } from '../data/configData';
import { generateJobs } from '../utils/jobGenerator';

const AppContext = createContext();

// --- Supabase ↔ JS mapping helpers ---
function jobFromRow(r) {
  return {
    id: r.id, title: r.title, company: r.company, logo: r.logo || '',
    location: r.location || '', description: r.description || '',
    category: r.category || '', workType: r.work_type || '', level: r.level || '',
    salary: r.salary || '', cargaHoraria: r.carga_horaria || '',
    badges: r.badges || [], informal: !!r.informal,
    status: r.status || 'ativa',
    createdAt: r.created_at, closedAt: r.closed_at,
  };
}

function jobToRow(j) {
  return {
    title: j.title, company: j.company, logo: j.logo || '',
    location: j.location || '', description: j.description || '',
    category: j.category || '', work_type: j.workType || '', level: j.level || '',
    salary: j.salary || '', carga_horaria: j.cargaHoraria || '',
    badges: j.badges || [], informal: !!j.informal,
    status: j.status || 'ativa',
  };
}

function appFromRow(r) {
  return {
    id: r.id, jobId: r.job_id, userId: r.user_id,
    resumeId: r.resume_id, status: r.status || 'enviada',
    appliedAt: r.applied_at,
  };
}

function resumeFromRow(r) {
  return {
    id: r.id, type: r.type || 'form', template: r.template || 'classico',
    ...(r.data || {}),
    fileName: r.file_name || '', fileSize: r.file_size || '',
    savedAt: r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '',
  };
}

// Default social proof config (used when no DB data)
const defaultSocialProof = {
  enabled: true, intervalMin: 20, intervalMax: 40, displayDuration: 5,
  timeFormat: 'relative', noRepeat: true,
  messages: [
    { id: 1, icon: '📨', template: '{name} de {state} enviou currículo recentemente', active: true },
    { id: 2, icon: '🎯', template: '{name} {initial}. se candidatou a {job}', active: true },
    { id: 3, icon: '📞', template: '{name} de {state} foi chamado(a) para entrevista', active: true },
    { id: 4, icon: '✅', template: '{name} {initial}. criou um currículo', active: true },
    { id: 5, icon: '🔥', template: 'Nova candidatura para {job}', active: true },
    { id: 6, icon: '🚀', template: '{name} de {state} ativou o disparo automático', active: true },
  ],
};

const defaultTestimonials = [
  { id: 1, name: 'Rafael Mendes', role: 'Assistente Administrativo', text: 'Consegui meu primeiro emprego em poucos dias usando a plataforma. Muito simples e direto!', photo: '', stars: 5, active: true },
  { id: 2, name: 'Juliana Costa', role: 'Atendente de Chat', text: 'Enviei meu currículo para várias vagas com um clique. Recebi retorno de 3 empresas na mesma semana.', photo: '', stars: 5, active: true },
  { id: 3, name: 'Carlos Eduardo', role: 'Digitador — Home Office', text: 'Encontrei uma vaga de digitador home office que era exatamente o que eu procurava. Recomendo!', photo: '', stars: 5, active: true },
  { id: 4, name: 'Ana Paula Silva', role: 'Social Media Jr.', text: 'O currículo ficou super profissional. As empresas elogiaram o formato.', photo: '', stars: 5, active: true },
  { id: 5, name: 'Lucas Oliveira', role: 'Suporte Técnico', text: 'Plataforma fácil de usar. Em 5 minutos já tinha meu currículo pronto e enviado para mais de 10 vagas.', photo: '', stars: 5, active: true },
  { id: 6, name: 'Fernanda Rocha', role: 'Auxiliar Financeiro', text: 'Estava desempregada há meses. Aqui encontrei vagas reais e fui chamada para entrevista em uma semana!', photo: '', stars: 5, active: true },
];

const defaultVideos = [
  { id: 1, title: 'Como criar seu currículo em 2 minutos', duration: '2:15', url: '', icon: '📝', thumb: 'gradient-indigo', active: true },
  { id: 2, title: 'Ana conta como conseguiu emprego com o Emprega+', duration: '1:42', url: '', icon: '💬', thumb: 'gradient-purple', active: true },
];

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || null;
  const mountedRef = useRef(true);

  // --- State ---
  const [jobs, setJobs] = useState([]);
  const [landingTexts, setLandingTexts] = useState(initialLandingTexts);
  const [savedResumes, setSavedResumes] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [hasVisitedVagas, setHasVisitedVagas] = useState(false);

  // Config tables
  const [sendPlans, setSendPlans] = useState(defaultSendPlans);
  const [autoDispatchConfig, setAutoDispatchConfig] = useState(defaultAutoDispatchConfig);
  const [upsellTexts, setUpsellTexts] = useState(defaultUpsellTexts);
  const [siteConfig, setSiteConfig] = useState(defaultSiteConfig);
  const [rotationConfig, setRotationConfig] = useState(defaultRotationConfig);
  const [socialProofConfig, setSocialProofConfig] = useState(defaultSocialProof);

  // Landing data
  const [companies, setCompanies] = useState([]);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [landingVideos, setLandingVideos] = useState(defaultVideos);

  // hasVisitedVagas is UX-only, keep in localStorage
  useEffect(() => {
    if (userId) {
      try {
        const v = localStorage.getItem(`emprega_visited_vagas_${userId}`);
        setHasVisitedVagas(v ? JSON.parse(v) : false);
      } catch { setHasVisitedVagas(false); }
    } else {
      setHasVisitedVagas(false);
    }
  }, [userId]);

  const markVagasVisited = () => {
    setHasVisitedVagas(true);
    if (userId) localStorage.setItem(`emprega_visited_vagas_${userId}`, 'true');
  };

  // ============================================
  // FETCH ALL DATA FROM SUPABASE ON MOUNT
  // ============================================
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function loadAll() {
      try {
        // Fetch all global data in parallel
        const [jobsRes, plansRes, dispatchRes, upsellRes, siteRes, rotationRes, socialRes, companiesRes, testimonialsRes, videosRes] = await Promise.all([
          supabase.from('jobs').select('*').order('created_at', { ascending: false }),
          supabase.from('send_plans').select('*').order('sort_order'),
          supabase.from('dispatch_config').select('*').eq('id', 1).single(),
          supabase.from('upsell_texts').select('*').eq('id', 1).single(),
          supabase.from('site_config').select('*').eq('id', 1).single(),
          supabase.from('rotation_config').select('*').eq('id', 1).single(),
          supabase.from('social_proof_config').select('*').eq('id', 1).single(),
          supabase.from('companies').select('*').order('id'),
          supabase.from('testimonials').select('*').order('id'),
          supabase.from('videos').select('*').order('id'),
        ]);

        if (cancelled) return;

        // Jobs — seed initial if empty
        if (jobsRes.data && jobsRes.data.length > 0) {
          setJobs(jobsRes.data.map(jobFromRow));
        } else if (!jobsRes.error) {
          // Seed initial jobs
          const seedRows = initialJobs.map(j => ({
            ...jobToRow(j),
            created_at: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
          }));
          const { data: seeded } = await supabase.from('jobs').insert(seedRows).select();
          if (seeded && !cancelled) setJobs(seeded.map(jobFromRow));
        }

        // Plans
        if (plansRes.data && plansRes.data.length > 0) {
          setSendPlans(plansRes.data.map(p => ({
            id: p.id, name: p.name, credits: p.credits,
            price: Number(p.price), active: p.active, popular: p.popular,
          })));
        }

        // Single-row configs — use data or keep defaults
        if (dispatchRes.data?.config) setAutoDispatchConfig({ ...defaultAutoDispatchConfig, ...dispatchRes.data.config });
        if (upsellRes.data?.config) setUpsellTexts({ ...defaultUpsellTexts, ...upsellRes.data.config });
        if (siteRes.data?.config) setSiteConfig({ ...defaultSiteConfig, ...siteRes.data.config });
        if (rotationRes.data?.config) setRotationConfig({ ...defaultRotationConfig, ...rotationRes.data.config });
        if (socialRes.data?.config) setSocialProofConfig({ ...defaultSocialProof, ...socialRes.data.config });

        // Companies — seed from jobs if empty
        if (companiesRes.data && companiesRes.data.length > 0) {
          setCompanies(companiesRes.data);
        } else if (!companiesRes.error) {
          const jobList = jobsRes.data?.length ? jobsRes.data : initialJobs;
          const map = new Map();
          jobList.forEach(j => {
            const name = j.company || j.title;
            if (name && !map.has(name)) map.set(name, j.logo || '');
          });
          const seedCompanies = Array.from(map.entries()).map(([name, logo]) => ({ name, logo, active: true }));
          if (seedCompanies.length > 0) {
            const { data: seeded } = await supabase.from('companies').insert(seedCompanies).select();
            if (seeded && !cancelled) setCompanies(seeded);
          }
        }

        // Testimonials — seed defaults if empty
        if (testimonialsRes.data && testimonialsRes.data.length > 0) {
          setTestimonials(testimonialsRes.data);
        } else if (!testimonialsRes.error) {
          const seedT = defaultTestimonials.map(({ id, ...rest }) => rest);
          const { data: seeded } = await supabase.from('testimonials').insert(seedT).select();
          if (seeded && !cancelled) setTestimonials(seeded);
        }

        // Videos — seed defaults if empty
        if (videosRes.data && videosRes.data.length > 0) {
          setLandingVideos(videosRes.data);
        } else if (!videosRes.error) {
          const seedV = defaultVideos.map(({ id, ...rest }) => rest);
          const { data: seeded } = await supabase.from('videos').insert(seedV).select();
          if (seeded && !cancelled) setLandingVideos(seeded);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    }

    loadAll();
    return () => { cancelled = true; mountedRef.current = false; };
  }, []);

  // ============================================
  // FETCH USER-SPECIFIC DATA (applications, resumes)
  // ============================================
  useEffect(() => {
    if (!userId) {
      setAppliedJobs([]);
      setSavedResumes([]);
      return;
    }
    let cancelled = false;

    async function loadUserData() {
      const [appsRes, resumesRes] = await Promise.all([
        supabase.from('applications').select('*').eq('user_id', userId).order('applied_at', { ascending: false }),
        supabase.from('resumes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      if (appsRes.data) setAppliedJobs(appsRes.data.map(appFromRow));
      if (resumesRes.data) setSavedResumes(resumesRes.data.map(resumeFromRow));
    }

    loadUserData();
    return () => { cancelled = true; };
  }, [userId]);

  // ============================================
  // JOB CRUD
  // ============================================
  const addJob = async (job) => {
    const row = jobToRow(job);
    const { data, error } = await supabase.from('jobs').insert(row).select().single();
    if (data && !error) setJobs(prev => [jobFromRow(data), ...prev]);
  };

  const editJob = async (id, updatedJob) => {
    const cols = {};
    if (updatedJob.title !== undefined) cols.title = updatedJob.title;
    if (updatedJob.company !== undefined) cols.company = updatedJob.company;
    if (updatedJob.logo !== undefined) cols.logo = updatedJob.logo;
    if (updatedJob.location !== undefined) cols.location = updatedJob.location;
    if (updatedJob.description !== undefined) cols.description = updatedJob.description;
    if (updatedJob.category !== undefined) cols.category = updatedJob.category;
    if (updatedJob.workType !== undefined) cols.work_type = updatedJob.workType;
    if (updatedJob.level !== undefined) cols.level = updatedJob.level;
    if (updatedJob.salary !== undefined) cols.salary = updatedJob.salary;
    if (updatedJob.cargaHoraria !== undefined) cols.carga_horaria = updatedJob.cargaHoraria;
    if (updatedJob.badges !== undefined) cols.badges = updatedJob.badges;
    if (updatedJob.informal !== undefined) cols.informal = updatedJob.informal;
    if (updatedJob.status !== undefined) cols.status = updatedJob.status;

    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedJob } : j));
    await supabase.from('jobs').update(cols).eq('id', id);
  };

  const closeJob = async (id) => {
    const now = new Date().toISOString();
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'encerrada', closedAt: now } : j));
    await supabase.from('jobs').update({ status: 'encerrada', closed_at: now }).eq('id', id);
    // Close related applications
    await supabase.from('applications').update({ status: 'encerrada' }).eq('job_id', id);
    setAppliedJobs(prev => prev.map(a => a.jobId === id ? { ...a, status: 'encerrada' } : a));
  };

  const reopenJob = async (id) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'ativa', closedAt: undefined } : j));
    await supabase.from('jobs').update({ status: 'ativa', closed_at: null }).eq('id', id);
  };

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    await supabase.from('jobs').delete().eq('id', id);
  };

  const regenerateAllJobs = async (count) => {
    const newJobs = generateJobs(count, 1);
    // Delete all existing jobs
    await supabase.from('jobs').delete().neq('id', 0);
    // Insert new ones
    const rows = newJobs.map(j => ({
      ...jobToRow(j),
      created_at: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
    }));
    const { data } = await supabase.from('jobs').insert(rows).select();
    if (data) setJobs(data.map(jobFromRow));
    return data?.length || 0;
  };

  const updateLandingTexts = (newTexts) => {
    setLandingTexts(prev => ({ ...prev, ...newTexts }));
  };

  // ============================================
  // RESUMES
  // ============================================
  const saveResume = async (resume) => {
    if (!userId) return;
    const { id: _id, savedAt: _s, ...resumeData } = resume;
    const row = {
      user_id: userId,
      type: resume.type || 'form',
      template: resume.template || 'classico',
      data: resumeData,
      file_name: resume.fileName || '',
      file_size: resume.fileSize || '',
    };
    const { data, error } = await supabase.from('resumes').insert(row).select().single();
    if (error) console.error('Erro ao salvar currículo:', error.message, error.details);
    if (data && !error) setSavedResumes(prev => [resumeFromRow(data), ...prev]);
  };

  const deleteResume = async (id) => {
    setSavedResumes(prev => prev.filter(r => r.id !== id));
    await supabase.from('resumes').delete().eq('id', id);
  };

  // ============================================
  // APPLICATIONS
  // ============================================
  const applyToJob = async (jobId, resumeId) => {
    if (!userId) return;
    const alreadyApplied = appliedJobs.some(a => a.jobId === jobId);
    if (alreadyApplied) return;

    const row = { user_id: userId, job_id: jobId, resume_id: resumeId || null, status: 'enviada' };
    const { data, error } = await supabase.from('applications').insert(row).select().single();
    if (data && !error) setAppliedJobs(prev => [appFromRow(data), ...prev]);
  };

  const isJobApplied = (jobId) => appliedJobs.some(a => a.jobId === jobId);
  const getAppliedJobIds = () => appliedJobs.map(a => a.jobId);
  const getAppliedCount = () => appliedJobs.length;

  const getUnappliedJobs = () => {
    const appliedIds = getAppliedJobIds();
    return jobs.filter(j => !appliedIds.includes(j.id) && j.status !== 'encerrada');
  };

  const bulkApply = async (count, filterFn) => {
    if (!userId) return 0;
    const unapplied = filterFn ? getUnappliedJobs().filter(filterFn) : getUnappliedJobs();
    const toApply = unapplied.slice(0, count);
    if (toApply.length === 0) return 0;

    const rows = toApply.map(j => ({ user_id: userId, job_id: j.id, status: 'enviada' }));
    const { data, error } = await supabase.from('applications').insert(rows).select();
    if (data && !error) setAppliedJobs(prev => [...data.map(appFromRow), ...prev]);
    return data?.length || 0;
  };

  // --- Application status ---
  const getApplicationStatus = (jobId) => {
    const entry = appliedJobs.find(a => a.jobId === jobId);
    if (!entry) return null;

    if (entry.status === 'encerrada') return 'encerrada';
    if (entry.status === 'pre_selecionado') return 'pre_selecionado';

    const job = jobs.find(j => j.id === jobId);
    if (job && job.status === 'encerrada') return 'encerrada';
    if (entry.status === 'em_analise') return 'em_analise';

    // Auto-progression
    const appliedAt = entry.appliedAt ? new Date(entry.appliedAt) : null;
    if (appliedAt) {
      const hoursElapsed = (Date.now() - appliedAt.getTime()) / (1000 * 60 * 60);
      if (hoursElapsed >= 24) return 'em_analise';
    }
    return 'enviada';
  };

  const updateApplicationStatus = async (targetUserId, jobId, newStatus) => {
    await supabase.from('applications').update({ status: newStatus }).eq('user_id', targetUserId).eq('job_id', jobId);
    if (targetUserId === userId) {
      setAppliedJobs(prev => prev.map(a => a.jobId === jobId ? { ...a, status: newStatus } : a));
    }
  };

  const bulkUpdateApplicationStatus = async (updates) => {
    for (const u of updates) {
      await supabase.from('applications').update({ status: u.newStatus }).eq('user_id', u.userId).eq('job_id', u.jobId);
    }
    // Refresh current user's applications
    const own = updates.filter(u => u.userId === userId);
    if (own.length > 0) {
      setAppliedJobs(prev => prev.map(a => {
        const match = own.find(u => u.jobId === a.jobId);
        return match ? { ...a, status: match.newStatus } : a;
      }));
    }
  };

  const getAllApplications = useCallback(async () => {
    const { data: apps } = await supabase.from('applications').select('*, profiles(nome)').order('applied_at', { ascending: false });
    if (!apps) return [];
    return apps.map(a => {
      const job = jobs.find(j => j.id === a.job_id);
      let effectiveStatus = a.status || 'enviada';
      if (effectiveStatus !== 'encerrada' && effectiveStatus !== 'pre_selecionado') {
        if (job && job.status === 'encerrada') effectiveStatus = 'encerrada';
        else if (effectiveStatus === 'enviada' && a.applied_at) {
          const hours = (Date.now() - new Date(a.applied_at).getTime()) / (1000 * 60 * 60);
          if (hours >= 24) effectiveStatus = 'em_analise';
        }
      }
      return {
        userId: a.user_id, jobId: a.job_id,
        jobTitle: job?.title || 'Vaga removida',
        jobCompany: job?.company || '—',
        appliedAt: a.applied_at, rawStatus: a.status || 'enviada',
        status: effectiveStatus,
        userName: a.profiles?.nome || `Usuário ${a.user_id?.substring(0, 8)}`,
      };
    });
  }, [jobs]);

  const getUserName = useCallback(async (uid) => {
    const { data } = await supabase.from('profiles').select('nome').eq('id', uid).single();
    return data?.nome || `Usuário ${uid?.substring(0, 8)}`;
  }, []);

  // ============================================
  // CONFIG TABLE UPDATES
  // ============================================
  const updateSendPlans = async (plans) => {
    setSendPlans(plans);
    const { error: delErr } = await supabase.from('send_plans').delete().neq('id', '');
    if (delErr) console.error('Erro ao deletar planos:', delErr.message);
    const rows = plans.map((p, i) => ({
      id: p.id, name: p.name, credits: p.credits,
      price: p.price, active: p.active, popular: p.popular, sort_order: i,
    }));
    const { error: insErr } = await supabase.from('send_plans').insert(rows);
    if (insErr) console.error('Erro ao inserir planos:', insErr.message);
  };

  const updateAutoDispatchConfig = async (config) => {
    const merged = { ...autoDispatchConfig, ...config };
    setAutoDispatchConfig(merged);
    const { error } = await supabase.from('dispatch_config').upsert({ id: 1, config: merged, updated_at: new Date().toISOString() });
    if (error) console.error('Erro ao salvar dispatch config:', error.message);
  };

  const updateUpsellTexts = async (texts) => {
    const merged = { ...upsellTexts, ...texts };
    setUpsellTexts(merged);
    const { error } = await supabase.from('upsell_texts').upsert({ id: 1, config: merged, updated_at: new Date().toISOString() });
    if (error) console.error('Erro ao salvar upsell texts:', error.message);
  };

  const updateSiteConfig = async (updates) => {
    const merged = { ...siteConfig, ...updates };
    setSiteConfig(merged);
    const { error } = await supabase.from('site_config').upsert({ id: 1, config: merged, updated_at: new Date().toISOString() });
    if (error) console.error('Erro ao salvar site config:', error.message);
  };

  const updateRotationConfig = async (updates) => {
    const merged = { ...rotationConfig, ...updates };
    setRotationConfig(merged);
    const { error } = await supabase.from('rotation_config').upsert({ id: 1, config: merged, updated_at: new Date().toISOString() });
    if (error) console.error('Erro ao salvar rotation config:', error.message);
  };

  const updateSocialProofConfig = async (updates) => {
    const merged = typeof updates === 'object' && updates.messages !== undefined
      ? { ...updates }
      : { ...socialProofConfig, ...updates };
    setSocialProofConfig(merged);
    const { error } = await supabase.from('social_proof_config').upsert({ id: 1, config: merged, updated_at: new Date().toISOString() });
    if (error) console.error('Erro ao salvar social proof config:', error.message);
  };

  // ============================================
  // COMPANIES / TESTIMONIALS / VIDEOS
  // ============================================
  const updateCompanies = async (newCompanies) => {
    setCompanies(newCompanies);
    // Propagate logo changes to jobs
    const logoMap = new Map();
    newCompanies.forEach(c => logoMap.set(c.name, c.logo || ''));
    setJobs(prev => {
      let changed = false;
      const updated = prev.map(j => {
        const newLogo = logoMap.get(j.company);
        if (newLogo !== undefined && newLogo !== j.logo) { changed = true; return { ...j, logo: newLogo }; }
        return j;
      });
      if (changed) {
        // Also update logos in Supabase
        updated.forEach(j => {
          const orig = prev.find(p => p.id === j.id);
          if (orig && orig.logo !== j.logo) supabase.from('jobs').update({ logo: j.logo }).eq('id', j.id);
        });
      }
      return changed ? updated : prev;
    });
    // Sync companies to Supabase
    await supabase.from('companies').delete().neq('id', 0);
    const rows = newCompanies.map(({ id, ...rest }) => rest);
    if (rows.length > 0) {
      const { data } = await supabase.from('companies').insert(rows).select();
      if (data) setCompanies(data);
    }
  };

  const updateTestimonials = async (t) => {
    setTestimonials(t);
    await supabase.from('testimonials').delete().neq('id', 0);
    const rows = t.map(({ id, ...rest }) => rest);
    if (rows.length > 0) {
      const { data } = await supabase.from('testimonials').insert(rows).select();
      if (data) setTestimonials(data);
    }
  };

  const updateLandingVideos = async (v) => {
    setLandingVideos(v);
    await supabase.from('videos').delete().neq('id', 0);
    const rows = v.map(({ id, ...rest }) => rest);
    if (rows.length > 0) {
      const { data } = await supabase.from('videos').insert(rows).select();
      if (data) setLandingVideos(data);
    }
  };

  // ============================================
  // ROTATION SYSTEM
  // ============================================
  const performRotationInternal = useCallback(async () => {
    const now = new Date().toISOString();
    const activeJobs = jobs.filter(j => j.status !== 'encerrada');
    const count = Math.min(rotationConfig.rotateCount, activeJobs.length);
    if (count === 0) return;

    const shuffled = [...activeJobs].sort(() => Math.random() - 0.5);
    const toClose = shuffled.slice(0, count);
    const toCloseIds = new Set(toClose.map(j => j.id));

    // Close selected jobs in DB
    for (const id of toCloseIds) {
      await supabase.from('jobs').update({ status: 'encerrada', closed_at: now }).eq('id', id);
      await supabase.from('applications').update({ status: 'encerrada' }).eq('job_id', id);
    }

    // Generate new jobs
    let newJobRows = generateJobs(count, 1).map(j => ({
      ...jobToRow(j),
      created_at: now,
    }));

    // Apply company logos
    if (companies.length > 0) {
      const logoMap = new Map();
      companies.forEach(c => { if (c.logo) logoMap.set(c.name, c.logo); });
      newJobRows = newJobRows.map(j => {
        const custom = logoMap.get(j.company);
        return custom ? { ...j, logo: custom } : j;
      });
    }

    const { data: inserted } = await supabase.from('jobs').insert(newJobRows).select();

    // Update local state
    setJobs(prev => [
      ...prev.map(j => toCloseIds.has(j.id) ? { ...j, status: 'encerrada', closedAt: now } : j),
      ...(inserted ? inserted.map(jobFromRow) : []),
    ]);

    setAppliedJobs(prev => prev.map(a =>
      toCloseIds.has(a.jobId) ? { ...a, status: 'encerrada' } : a
    ));

    // Save last rotation time
    await supabase.from('rotation_config').upsert({
      id: 1,
      config: rotationConfig,
      last_rotation: now,
      updated_at: now,
    });
  }, [jobs, rotationConfig, companies]);

  // Auto-rotation on mount
  useEffect(() => {
    if (!rotationConfig.enabled || jobs.length === 0) return;
    let cancelled = false;

    async function checkRotation() {
      const { data } = await supabase.from('rotation_config').select('last_rotation').eq('id', 1).single();
      if (cancelled) return;
      const lastDate = data?.last_rotation ? new Date(data.last_rotation) : null;
      const now = new Date();
      const intervalMs = rotationConfig.intervalDays * 24 * 60 * 60 * 1000;
      if (!lastDate || (now.getTime() - lastDate.getTime()) >= intervalMs) {
        performRotationInternal();
      }
    }

    checkRotation();
    return () => { cancelled = true; };
  }, [rotationConfig.enabled, jobs.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const manualRotation = () => performRotationInternal();

  // ============================================
  // UTILITY FUNCTIONS (unchanged)
  // ============================================
  const getStatusMessage = (status) => {
    const messages = {
      enviada: 'Currículo enviado com sucesso',
      em_analise: 'Seu currículo está sendo analisado pela empresa',
      pre_selecionado: 'Você foi pré-selecionado para a próxima etapa! 🎉',
      encerrada: null,
    };
    return messages[status] || messages.enviada;
  };

  const getClosedMessage = (jobId) => {
    const messages = rotationConfig.closedMessages || defaultRotationConfig.closedMessages;
    return messages[Math.abs(jobId || 0) % messages.length];
  };

  const getNewJobsToday = () => {
    const today = new Date().toDateString();
    return jobs.filter(j => j.status !== 'encerrada' && j.createdAt && new Date(j.createdAt).toDateString() === today).length;
  };

  const getActivityCount = () => {
    const d = new Date();
    return ((d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 17 + 23) % 35 + 12;
  };

  const getJobViews = (jobId) => {
    const h = ((jobId * 2654435761) >>> 0);
    return (h % 47) + 14;
  };

  const getJobApplications = (jobId) => {
    const h = ((jobId * 1597334677) >>> 0);
    return (h % 18) + 3;
  };

  const getActiveJobs = () => jobs.filter(j => j.status !== 'encerrada');

  return (
    <AppContext.Provider
      value={{
        jobs, addJob, editJob, deleteJob, closeJob, reopenJob, regenerateAllJobs,
        landingTexts, updateLandingTexts,
        savedResumes, saveResume, deleteResume,
        appliedJobs, applyToJob, isJobApplied, getUnappliedJobs, bulkApply, getAppliedCount, getAppliedJobIds,
        hasVisitedVagas, markVagasVisited,
        sendPlans, updateSendPlans,
        autoDispatchConfig, updateAutoDispatchConfig,
        upsellTexts, updateUpsellTexts,
        siteConfig, updateSiteConfig,
        socialProofConfig, updateSocialProofConfig,
        companies, updateCompanies,
        testimonials, updateTestimonials,
        landingVideos, updateLandingVideos,
        rotationConfig, updateRotationConfig, manualRotation,
        getActiveJobs, getApplicationStatus, getClosedMessage, getStatusMessage,
        getNewJobsToday, getActivityCount, getJobViews, getJobApplications,
        getAllApplications, getUserName, updateApplicationStatus, bulkUpdateApplicationStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
