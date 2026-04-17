import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { initialJobs, initialLandingTexts } from '../data/mockData';
import { defaultSendPlans, defaultAutoDispatchConfig, defaultUpsellTexts } from '../data/plansData';
import { defaultSiteConfig, defaultRotationConfig } from '../data/configData';
import { generateJobs } from '../utils/jobGenerator';

const AppContext = createContext();

function loadUserData(key, userId, fallback) {
  if (!userId) return fallback;
  try {
    const data = localStorage.getItem(`${key}_${userId}`);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveUserData(key, userId, value) {
  if (!userId) return;
  try {
    localStorage.setItem(`${key}_${userId}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key}:`, e.message);
  }
}

function safeLoadJSON(key, fallback) {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

// Normalize an appliedJobs entry (handles legacy format where entry was just a number)
function normalizeAppEntry(a) {
  if (typeof a === 'object' && a !== null) return a;
  return { jobId: a, appliedAt: new Date().toISOString(), status: 'enviada' };
}

function getEntryJobId(a) {
  return typeof a === 'object' && a !== null ? a.jobId : a;
}

// Update appliedJobs in localStorage for ALL users when jobs are closed
function updateAllUsersApplications(closedIds, currentUserId) {
  if (!closedIds || closedIds.size === 0) return;
  const now = new Date().toISOString();
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('emprega_applied_'));
    const skipKey = currentUserId ? `emprega_applied_${currentUserId}` : null;
    keys.forEach(key => {
      if (key === skipKey) return;
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (!Array.isArray(data)) return;
        let changed = false;
        const updated = data.map(a => {
          const entry = normalizeAppEntry(a);
          if (closedIds.has(entry.jobId) && entry.status !== 'encerrada') {
            changed = true;
            return { ...entry, status: 'encerrada' };
          }
          return entry;
        });
        if (changed) localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    });
  } catch {}
}

// Fix external logo URLs (clearbit/ui-avatars) → local paths
function migrateLogos(jobs) {
  return jobs.map(j => {
    if (!j.logo || (!j.logo.includes('clearbit') && !j.logo.includes('ui-avatars'))) return j;
    const companySlug = j.company
      ? j.company.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : 'default';
    return { ...j, logo: `/logos/${companySlug}.png` };
  });
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  // --- Jobs state (persisted globally) ---
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return migrateLogos(parsed);
      }
    } catch {}
    return initialJobs.map(j => ({
      ...j,
      status: j.status || 'ativa',
      createdAt: j.createdAt || new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
    }));
  });
  const [landingTexts, setLandingTexts] = useState(initialLandingTexts);
  const [nextJobId, setNextJobId] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Math.max(...parsed.map(j => j.id || 0), 0) + 1;
        }
      }
    } catch {}
    return initialJobs.length + 1;
  });

  // Persist jobs globally
  useEffect(() => {
    try { localStorage.setItem('emprega_jobs', JSON.stringify(jobs)); } catch {}
  }, [jobs]);

  // Per-user state
  const [savedResumes, setSavedResumes] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [hasVisitedVagas, setHasVisitedVagas] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  useEffect(() => {
    setUserDataLoaded(false);
    if (userId) {
      setSavedResumes(loadUserData('emprega_resumes', userId, []));
      setAppliedJobs(loadUserData('emprega_applied', userId, []));
      setHasVisitedVagas(loadUserData('emprega_visited_vagas', userId, false));
    } else {
      setSavedResumes([]);
      setAppliedJobs([]);
      setHasVisitedVagas(false);
    }
    setTimeout(() => setUserDataLoaded(true), 0);
  }, [userId]);

  useEffect(() => {
    if (userId && userDataLoaded) saveUserData('emprega_resumes', userId, savedResumes);
  }, [savedResumes, userId, userDataLoaded]);

  useEffect(() => {
    if (userId && userDataLoaded) saveUserData('emprega_applied', userId, appliedJobs);
  }, [appliedJobs, userId, userDataLoaded]);

  useEffect(() => {
    if (userId && userDataLoaded) saveUserData('emprega_visited_vagas', userId, hasVisitedVagas);
  }, [hasVisitedVagas, userId, userDataLoaded]);

  const markVagasVisited = () => setHasVisitedVagas(true);

  // Plans & monetization
  const [sendPlans, setSendPlans] = useState(() => safeLoadJSON('emprega_send_plans', defaultSendPlans));
  const [autoDispatchConfig, setAutoDispatchConfig] = useState(() => safeLoadJSON('emprega_dispatch_config', defaultAutoDispatchConfig));
  const [upsellTexts, setUpsellTexts] = useState(() => safeLoadJSON('emprega_upsell_texts', defaultUpsellTexts));
  const [siteConfig, setSiteConfig] = useState(() => {
    const saved = safeLoadJSON('emprega_site_config', null);
    // Merge saved over defaults so new fields are always present
    return saved ? { ...defaultSiteConfig, ...saved } : defaultSiteConfig;
  });

  const updateSendPlans = (plans) => setSendPlans(plans);
  const updateAutoDispatchConfig = (config) => setAutoDispatchConfig((prev) => ({ ...prev, ...config }));
  const updateUpsellTexts = (texts) => setUpsellTexts((prev) => ({ ...prev, ...texts }));
  const updateSiteConfig = (updates) => setSiteConfig((prev) => ({ ...prev, ...updates }));

  useEffect(() => {
    try { localStorage.setItem('emprega_site_config', JSON.stringify(siteConfig)); } catch {}
  }, [siteConfig]);

  useEffect(() => {
    try { localStorage.setItem('emprega_send_plans', JSON.stringify(sendPlans)); } catch {}
  }, [sendPlans]);

  useEffect(() => {
    try { localStorage.setItem('emprega_dispatch_config', JSON.stringify(autoDispatchConfig)); } catch {}
  }, [autoDispatchConfig]);

  useEffect(() => {
    try { localStorage.setItem('emprega_upsell_texts', JSON.stringify(upsellTexts)); } catch {}
  }, [upsellTexts]);

  // --- Rotation config ---
  const [rotationConfig, setRotationConfig] = useState(() => safeLoadJSON('emprega_rotation_config', defaultRotationConfig));

  useEffect(() => {
    try { localStorage.setItem('emprega_rotation_config', JSON.stringify(rotationConfig)); } catch {}
  }, [rotationConfig]);

  const updateRotationConfig = (updates) => setRotationConfig((prev) => ({ ...prev, ...updates }));

  const performRotationInternal = useCallback(() => {
    const now = new Date().toISOString();
    setJobs(prevJobs => {
      const activeJobs = prevJobs.filter(j => j.status !== 'encerrada');
      const count = Math.min(rotationConfig.rotateCount, activeJobs.length);
      if (count === 0) return prevJobs;

      const shuffled = [...activeJobs].sort(() => Math.random() - 0.5);
      const toCloseIds = new Set(shuffled.slice(0, count).map(j => j.id));

      const updated = prevJobs.map(j =>
        toCloseIds.has(j.id) ? { ...j, status: 'encerrada', closedAt: now } : j
      );

      const maxId = Math.max(...updated.map(j => j.id), 0) + 1;
      let newJobs = generateJobs(count, maxId);

      // Apply admin-uploaded logos to new jobs
      const currentCompanies = safeLoadJSON('emprega_companies', []);
      if (currentCompanies.length > 0) {
        const logoMap = new Map();
        currentCompanies.forEach(c => { if (c.logo) logoMap.set(c.name, c.logo); });
        newJobs = newJobs.map(j => {
          const custom = logoMap.get(j.company);
          return custom ? { ...j, logo: custom } : j;
        });
      }

      setNextJobId(maxId + count);

      // Update current user's appliedJobs
      setAppliedJobs(prev => prev.map(a => {
        const entry = normalizeAppEntry(a);
        if (toCloseIds.has(entry.jobId)) return { ...entry, status: 'encerrada' };
        return entry;
      }));

      // Update all other users
      updateAllUsersApplications(toCloseIds, userId);

      return [...updated, ...newJobs];
    });
    localStorage.setItem('emprega_last_rotation', now);
  }, [rotationConfig.rotateCount, userId]);

  // Auto-rotation on mount
  useEffect(() => {
    if (!rotationConfig.enabled) return;
    try {
      const lastRotation = localStorage.getItem('emprega_last_rotation');
      const lastDate = lastRotation ? new Date(lastRotation) : null;
      const now = new Date();
      const intervalMs = rotationConfig.intervalDays * 24 * 60 * 60 * 1000;
      if (!lastDate || (now.getTime() - lastDate.getTime()) >= intervalMs) {
        performRotationInternal();
      }
    } catch (e) { console.warn('Rotation check failed:', e); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const manualRotation = () => performRotationInternal();

  // --- Job CRUD ---
  const addJob = (job) => {
    setJobs((prev) => [...prev, { ...job, id: nextJobId, status: 'ativa', createdAt: new Date().toISOString() }]);
    setNextJobId((prev) => prev + 1);
  };

  const editJob = (id, updatedJob) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updatedJob } : j)));
  };

  const closeJob = (id) => {
    const now = new Date().toISOString();
    const closedIds = new Set([id]);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'encerrada', closedAt: now } : j));
    setAppliedJobs(prev => prev.map(a => {
      const entry = normalizeAppEntry(a);
      if (entry.jobId === id) return { ...entry, status: 'encerrada' };
      return entry;
    }));
    updateAllUsersApplications(closedIds, userId);
  };

  const reopenJob = (id) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'ativa', closedAt: undefined } : j));
  };

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const regenerateAllJobs = (count) => {
    const newJobs = generateJobs(count, 1);
    setJobs(newJobs);
    setNextJobId(newJobs.length + 1);
    return newJobs.length;
  };

  const updateLandingTexts = (newTexts) => {
    setLandingTexts((prev) => ({ ...prev, ...newTexts }));
  };

  const saveResume = (resume) => {
    setSavedResumes((prev) => [...prev, { ...resume, id: Date.now(), savedAt: new Date().toLocaleString('pt-BR') }]);
  };

  const deleteResume = (id) => {
    setSavedResumes((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Application management ---
  const applyToJob = (jobId, resumeId) => {
    const alreadyApplied = appliedJobs.some((a) => getEntryJobId(a) === jobId);
    if (!alreadyApplied) {
      const entry = { jobId, appliedAt: new Date().toISOString(), status: 'enviada' };
      if (resumeId) entry.resumeId = resumeId;
      setAppliedJobs((prev) => [...prev, entry]);
    }
  };

  const isJobApplied = (jobId) =>
    appliedJobs.some((a) => getEntryJobId(a) === jobId);

  const getAppliedJobIds = () =>
    appliedJobs.map((a) => getEntryJobId(a));

  const getUnappliedJobs = () => {
    const appliedIds = getAppliedJobIds();
    return jobs.filter((j) => !appliedIds.includes(j.id) && j.status !== 'encerrada');
  };

  const getAppliedCount = () => appliedJobs.length;

  const bulkApply = (count, filterFn) => {
    const unapplied = filterFn ? getUnappliedJobs().filter(filterFn) : getUnappliedJobs();
    const toApply = unapplied.slice(0, count);
    const newEntries = toApply.map((j) => ({ jobId: j.id, appliedAt: new Date().toISOString(), status: 'enviada' }));
    setAppliedJobs((prev) => [...prev, ...newEntries]);
    return toApply.length;
  };

  // --- Application status (4 levels) ---
  // Status flow: enviada → em_analise → pre_selecionado → encerrada
  const getApplicationStatus = (jobId) => {
    const entry = appliedJobs.find(a => getEntryJobId(a) === jobId);
    if (!entry) return null;
    const e = normalizeAppEntry(entry);

    // If explicitly set by admin, use that
    if (e.status === 'encerrada') return 'encerrada';
    if (e.status === 'pre_selecionado') return 'pre_selecionado';

    // If the job itself is closed, the application is closed
    const job = jobs.find(j => j.id === jobId);
    if (job && job.status === 'encerrada') return 'encerrada';

    // If admin set em_analise, keep it
    if (e.status === 'em_analise') return 'em_analise';

    // Auto-progression based on time (only for 'enviada')
    const appliedAt = e.appliedAt ? new Date(e.appliedAt) : null;
    if (appliedAt) {
      const hoursElapsed = (Date.now() - appliedAt.getTime()) / (1000 * 60 * 60);
      if (hoursElapsed >= 24) return 'em_analise';
    }

    return 'enviada';
  };

  // Admin: update a single user's application status
  const updateApplicationStatus = (targetUserId, jobId, newStatus) => {
    if (targetUserId === userId) {
      // Current user
      setAppliedJobs(prev => prev.map(a => {
        const entry = normalizeAppEntry(a);
        if (entry.jobId === jobId) return { ...entry, status: newStatus };
        return entry;
      }));
    } else {
      // Another user — update directly in localStorage
      const key = `emprega_applied_${targetUserId}`;
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = data.map(a => {
          const entry = normalizeAppEntry(a);
          if (entry.jobId === jobId) return { ...entry, status: newStatus };
          return entry;
        });
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
    }
  };

  // Admin: bulk update application statuses
  const bulkUpdateApplicationStatus = (updates) => {
    // updates: Array of { userId, jobId, newStatus }
    const byUser = {};
    updates.forEach(u => {
      if (!byUser[u.userId]) byUser[u.userId] = [];
      byUser[u.userId].push(u);
    });

    Object.entries(byUser).forEach(([uid, userUpdates]) => {
      if (uid === userId) {
        setAppliedJobs(prev => prev.map(a => {
          const entry = normalizeAppEntry(a);
          const match = userUpdates.find(u => u.jobId === entry.jobId);
          if (match) return { ...entry, status: match.newStatus };
          return entry;
        }));
      } else {
        const key = `emprega_applied_${uid}`;
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          const updated = data.map(a => {
            const entry = normalizeAppEntry(a);
            const match = userUpdates.find(u => u.jobId === entry.jobId);
            if (match) return { ...entry, status: match.newStatus };
            return entry;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
      }
    });
  };

  // Admin: get ALL applications across all users
  const getAllApplications = () => {
    const allApps = [];
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('emprega_applied_'));
      keys.forEach(key => {
        const uid = key.replace('emprega_applied_', '');
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!Array.isArray(data)) return;
          data.forEach(a => {
            const entry = normalizeAppEntry(a);
            const job = jobs.find(j => j.id === entry.jobId);
            // Compute effective status
            let effectiveStatus = entry.status || 'enviada';
            if (effectiveStatus !== 'encerrada' && effectiveStatus !== 'pre_selecionado') {
              if (job && job.status === 'encerrada') {
                effectiveStatus = 'encerrada';
              } else if (effectiveStatus === 'enviada' && entry.appliedAt) {
                const hours = (Date.now() - new Date(entry.appliedAt).getTime()) / (1000 * 60 * 60);
                if (hours >= 24) effectiveStatus = 'em_analise';
              }
            }
            allApps.push({
              userId: uid,
              jobId: entry.jobId,
              jobTitle: job?.title || 'Vaga removida',
              jobCompany: job?.company || '—',
              appliedAt: entry.appliedAt,
              rawStatus: entry.status || 'enviada',
              status: effectiveStatus,
            });
          });
        } catch {}
      });
    } catch {}
    return allApps;
  };

  // Get user name from registeredUsers in localStorage
  const getUserName = (uid) => {
    try {
      const users = JSON.parse(localStorage.getItem('emprega_users') || '[]');
      const u = users.find(u => String(u.id) === String(uid));
      return u ? u.nome : `Usuário ${uid}`;
    } catch { return `Usuário ${uid}`; }
  };

  const getStatusMessage = (status) => {
    const messages = {
      enviada: 'Currículo enviado com sucesso',
      em_analise: 'Seu currículo está sendo analisado pela empresa',
      pre_selecionado: 'Você foi pré-selecionado para a próxima etapa! 🎉',
      encerrada: null, // uses getClosedMessage instead
    };
    return messages[status] || messages.enviada;
  };

  const getClosedMessage = (jobId) => {
    const messages = rotationConfig.closedMessages || defaultRotationConfig.closedMessages;
    return messages[Math.abs(jobId || 0) % messages.length];
  };

  // Activity indicators
  const getNewJobsToday = () => {
    const today = new Date().toDateString();
    return jobs.filter(j => j.status !== 'encerrada' && j.createdAt && new Date(j.createdAt).toDateString() === today).length;
  };

  const getActivityCount = () => {
    const d = new Date();
    return ((d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) * 17 + 23) % 35 + 12;
  };

  // Deterministic per-job fake counters (views, applications)
  const getJobViews = (jobId) => {
    const h = ((jobId * 2654435761) >>> 0);
    return (h % 47) + 14;
  };

  const getJobApplications = (jobId) => {
    const h = ((jobId * 1597334677) >>> 0);
    return (h % 18) + 3;
  };

  const getActiveJobs = () => jobs.filter(j => j.status !== 'encerrada');

  // Social proof notification config (admin-editable, persisted)
  const [socialProofConfig, setSocialProofConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_social_proof');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        intervalMin: 20,
        intervalMax: 40,
        displayDuration: 5,
        timeFormat: 'relative',
        messages: [
          { id: 1, icon: '📨', template: '{name} de {state} enviou currículo recentemente', active: true },
          { id: 2, icon: '🎯', template: '{name} {initial}. se candidatou a {job}', active: true },
          { id: 3, icon: '📞', template: '{name} de {state} foi chamado(a) para entrevista', active: true },
          { id: 4, icon: '✅', template: '{name} {initial}. criou um currículo', active: true },
          { id: 5, icon: '🔥', template: 'Nova candidatura para {job}', active: true },
          { id: 6, icon: '🚀', template: '{name} de {state} ativou o disparo automático', active: true },
        ],
        noRepeat: true,
      };
    } catch { return { enabled: true, intervalMin: 20, intervalMax: 40, displayDuration: 5, timeFormat: 'relative', messages: [], noRepeat: true }; }
  });

  useEffect(() => {
    try { localStorage.setItem('emprega_social_proof', JSON.stringify(socialProofConfig)); } catch {}
  }, [socialProofConfig]);

  const updateSocialProofConfig = (updates) => setSocialProofConfig(
    typeof updates === 'object' && updates.messages !== undefined
      ? { ...updates }
      : (prev) => ({ ...prev, ...updates })
  );

  // Companies (admin-editable, shown in BrandMarquee + job cards)
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_companies');
      const migrated = localStorage.getItem('emprega_companies_v2');
      if (saved && migrated) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Derive from actual jobs — extract unique companies with their logos
    const map = new Map();
    const source = (() => {
      try {
        const s = localStorage.getItem('emprega_jobs');
        if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
      } catch {}
      return initialJobs;
    })();
    source.forEach(j => {
      if (j.company && !map.has(j.company)) {
        map.set(j.company, j.logo || '');
      }
    });
    let id = 1;
    const derived = Array.from(map.entries()).map(([name, logo]) => ({
      id: id++, name, logo, active: true,
    }));
    try { localStorage.setItem('emprega_companies_v2', '1'); } catch {}
    return derived;
  });
  useEffect(() => { try { localStorage.setItem('emprega_companies', JSON.stringify(companies)); } catch(e) { console.warn('Failed to save companies:', e); } }, [companies]);

  const updateCompanies = (newCompanies) => {
    // Build a map of logo changes: companyName → newLogo
    const logoMap = new Map();
    newCompanies.forEach(c => logoMap.set(c.name, c.logo || ''));
    // Propagate logo changes to all jobs with matching company name
    setJobs(prev => {
      let changed = false;
      const updated = prev.map(j => {
        const newLogo = logoMap.get(j.company);
        if (newLogo !== undefined && newLogo !== j.logo) {
          changed = true;
          return { ...j, logo: newLogo };
        }
        return j;
      });
      return changed ? updated : prev;
    });
    setCompanies(newCompanies);
  };

  // Testimonials (admin-editable, shown on landing)
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_testimonials');
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'Rafael Mendes', role: 'Assistente Administrativo', text: 'Consegui meu primeiro emprego em poucos dias usando a plataforma. Muito simples e direto!', photo: '', stars: 5, active: true },
        { id: 2, name: 'Juliana Costa', role: 'Atendente de Chat', text: 'Enviei meu currículo para várias vagas com um clique. Recebi retorno de 3 empresas na mesma semana.', photo: '', stars: 5, active: true },
        { id: 3, name: 'Carlos Eduardo', role: 'Digitador — Home Office', text: 'Encontrei uma vaga de digitador home office que era exatamente o que eu procurava. Recomendo!', photo: '', stars: 5, active: true },
        { id: 4, name: 'Ana Paula Silva', role: 'Social Media Jr.', text: 'O currículo ficou super profissional. As empresas elogiaram o formato.', photo: '', stars: 5, active: true },
        { id: 5, name: 'Lucas Oliveira', role: 'Suporte Técnico', text: 'Plataforma fácil de usar. Em 5 minutos já tinha meu currículo pronto e enviado para mais de 10 vagas.', photo: '', stars: 5, active: true },
        { id: 6, name: 'Fernanda Rocha', role: 'Auxiliar Financeiro', text: 'Estava desempregada há meses. Aqui encontrei vagas reais e fui chamada para entrevista em uma semana!', photo: '', stars: 5, active: true },
      ];
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('emprega_testimonials', JSON.stringify(testimonials)); } catch(e) { console.warn('Failed to save testimonials:', e); } }, [testimonials]);
  const updateTestimonials = (t) => setTestimonials(t);

  // Videos (admin-editable, shown on landing)
  const [landingVideos, setLandingVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('emprega_videos');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Como criar seu currículo em 2 minutos', duration: '2:15', url: '', icon: '📝', thumb: 'gradient-indigo', active: true },
        { id: 2, title: 'Ana conta como conseguiu emprego com o Emprega+', duration: '1:42', url: '', icon: '💬', thumb: 'gradient-purple', active: true },
      ];
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('emprega_videos', JSON.stringify(landingVideos)); } catch(e) { console.warn('Failed to save videos:', e); } }, [landingVideos]);
  const updateLandingVideos = (v) => setLandingVideos(v);

  // Sync from localStorage when another tab makes changes
  useEffect(() => {
    const handleStorage = (e) => {
      try {
        if (e.key === 'emprega_companies' && e.newValue) setCompanies(JSON.parse(e.newValue));
        if (e.key === 'emprega_testimonials' && e.newValue) setTestimonials(JSON.parse(e.newValue));
        if (e.key === 'emprega_videos' && e.newValue) setLandingVideos(JSON.parse(e.newValue));
        if (e.key === 'emprega_jobs' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) setJobs(parsed);
        }
        if (e.key && e.key.startsWith('emprega_applied_') && userId && e.key === `emprega_applied_${userId}` && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAppliedJobs(parsed);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
