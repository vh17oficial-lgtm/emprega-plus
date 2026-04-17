import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import PhotoUpload from './PhotoUpload';
import { serializeExperiences, serializeEducation, serializeCourses, serializeSkills, serializeLanguages } from './resumeUtils';
import { generateSampleResume, getProfileLabels } from './resumeSampleData';

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white placeholder:text-gray-300';
const labelClass = 'block text-xs font-medium text-gray-500 mb-1';
const sectionHeader = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3';
const addBtn = 'inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors mt-2';
const removeBtn = 'text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors';
const cardClass = 'bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 relative';

const emptyExperience = () => ({ empresa: '', cargo: '', inicio: '', fim: '', atual: false, funcoes: [''] });
const emptyEducation = () => ({ curso: '', instituicao: '', ano: '' });
const emptyCourse = () => ({ nome: '', instituicao: '', ano: '' });
const emptyLanguage = () => ({ idioma: '', nivel: 'Básico' });

const LEVEL_OPTIONS = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'];

const SUMMARY_TEMPLATES = [
  'Profissional dedicado com experiência em {cargo}, buscando oportunidades para aplicar habilidades e contribuir com resultados.',
  'Profissional proativo e orientado a resultados, com vivência em {cargo}. Busco novos desafios em empresas que valorizam crescimento.',
  'Trabalhador comprometido com experiência em {cargo}, com foco em eficiência e qualidade. Disponível para início imediato.',
];

export default function ResumeForm({ onGenerate, initialData }) {
  const [template, setTemplate] = useState(initialData?.template || 'classico');
  const [photo, setPhoto] = useState(initialData?.photo || null);

  // Basic fields
  const [nome, setNome] = useState(initialData?.nome || '');
  const [cargo, setCargo] = useState(initialData?.cargo || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [telefone, setTelefone] = useState(initialData?.telefone || '');
  const [endereco, setEndereco] = useState(initialData?.endereco || '');
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || '');
  const [resumo, setResumo] = useState(initialData?.resumo || '');

  // Structured fields
  const [experiences, setExperiences] = useState(initialData?._experiences || [emptyExperience()]);
  const [education, setEducation] = useState(initialData?._education || [emptyEducation()]);
  const [courses, setCourses] = useState(initialData?._courses || [emptyCourse()]);
  const [skills, setSkills] = useState(initialData?._skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState(initialData?._languages || [emptyLanguage()]);

  // --- Experience handlers ---
  const updateExp = (idx, field, value) => {
    setExperiences(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };
  const addExperience = () => setExperiences(prev => [...prev, emptyExperience()]);
  const removeExperience = (idx) => setExperiences(prev => prev.filter((_, i) => i !== idx));
  const addFunction = (expIdx) => {
    setExperiences(prev => prev.map((e, i) => i === expIdx ? { ...e, funcoes: [...e.funcoes, ''] } : e));
  };
  const updateFunction = (expIdx, funcIdx, value) => {
    setExperiences(prev => prev.map((e, i) =>
      i === expIdx ? { ...e, funcoes: e.funcoes.map((f, j) => j === funcIdx ? value : f) } : e
    ));
  };
  const removeFunction = (expIdx, funcIdx) => {
    setExperiences(prev => prev.map((e, i) =>
      i === expIdx ? { ...e, funcoes: e.funcoes.filter((_, j) => j !== funcIdx) } : e
    ));
  };

  // --- Education handlers ---
  const updateEdu = (idx, field, value) => {
    setEducation(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };
  const addEducation = () => setEducation(prev => [...prev, emptyEducation()]);
  const removeEducation = (idx) => setEducation(prev => prev.filter((_, i) => i !== idx));

  // --- Course handlers ---
  const updateCourse = (idx, field, value) => {
    setCourses(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const addCourse = () => setCourses(prev => [...prev, emptyCourse()]);
  const removeCourse = (idx) => setCourses(prev => prev.filter((_, i) => i !== idx));

  // --- Skills handlers ---
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/g, '');
      if (val && !skills.includes(val)) setSkills(prev => [...prev, val]);
      setSkillInput('');
    }
  };
  const removeSkill = (idx) => setSkills(prev => prev.filter((_, i) => i !== idx));

  // --- Language handlers ---
  const updateLang = (idx, field, value) => {
    setLanguages(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };
  const addLanguage = () => setLanguages(prev => [...prev, emptyLanguage()]);
  const removeLanguage = (idx) => setLanguages(prev => prev.filter((_, i) => i !== idx));

  // --- AI summary ---
  const generateSummary = () => {
    const tpl = SUMMARY_TEMPLATES[Math.floor(Math.random() * SUMMARY_TEMPLATES.length)];
    setResumo(tpl.replace('{cargo}', cargo || 'diversas áreas'));
  };

  // --- Auto-fill ---
  const [selectedProfile, setSelectedProfile] = useState('administrativo');
  const profileLabels = getProfileLabels();

  const fillSample = () => {
    const data = generateSampleResume(selectedProfile);
    if (!data) return;
    setNome(data.nome);
    setCargo(data.cargo);
    setEmail(data.email);
    setTelefone(data.telefone);
    setEndereco(data.endereco);
    setLinkedin(data.linkedin);
    setResumo(data.resumo);
    setExperiences(data.experiences);
    setEducation(data.education);
    setCourses(data.courses);
    setSkills(data.skills);
    setLanguages(data.languages);
    setSkillInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      nome, cargo, resumo, email, telefone, endereco, linkedin, template, photo,
      experiencia: serializeExperiences(experiences),
      formacao: serializeEducation(education),
      cursos: serializeCourses(courses),
      habilidades: serializeSkills(skills),
      idiomas: serializeLanguages(languages),
      _experiences: experiences,
      _education: education,
      _courses: courses,
      _skills: skills,
      _languages: languages,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <TemplateSelector selected={template} onSelect={setTemplate} />

      {/* Auto-fill section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700 mb-1">✨ Preencher automaticamente</p>
            <p className="text-xs text-gray-500">Gere um exemplo completo para facilitar o preenchimento</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedProfile}
              onChange={e => setSelectedProfile(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-indigo-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {Object.entries(profileLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={fillSample}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              ✨ Gerar exemplo
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-6">
        {/* Photo + basic info */}
        <div className="flex flex-col sm:flex-row gap-5">
          <PhotoUpload photo={photo} onPhotoChange={setPhoto} />
          <div className="flex-1 grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nome completo *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Maria Silva" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cargo / Título profissional *</label>
              <input value={cargo} onChange={e => setCargo(e.target.value)} required placeholder="Assistente Administrativo" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className={sectionHeader}>Informações de Contato</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="maria@email.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefone *</label>
              <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} required placeholder="(11) 99999-9999" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cidade / Estado *</label>
              <input value={endereco} onChange={e => setEndereco(e.target.value)} required placeholder="São Paulo, SP" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/maria" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass}>Resumo profissional / Objetivo</label>
            <button type="button" onClick={generateSummary} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors">
              ✨ Gerar com IA
            </button>
          </div>
          <textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} placeholder="Breve resumo sobre você, seus objetivos e diferenciais profissionais..." className={`${inputClass} resize-none`} />
        </div>

        {/* ====== EXPERIÊNCIA PROFISSIONAL ====== */}
        <div>
          <h3 className={sectionHeader}>Experiência Profissional</h3>
          <div className="space-y-4">
            {experiences.map((exp, expIdx) => (
              <div key={expIdx} className={cardClass}>
                {experiences.length > 1 && (
                  <div className="absolute top-3 right-3">
                    <button type="button" onClick={() => removeExperience(expIdx)} className={removeBtn}>✕ Remover</button>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Empresa *</label>
                    <input value={exp.empresa} onChange={e => updateExp(expIdx, 'empresa', e.target.value)} required placeholder="Nome da empresa" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Cargo *</label>
                    <input value={exp.cargo} onChange={e => updateExp(expIdx, 'cargo', e.target.value)} required placeholder="Cargo ocupado" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className={labelClass}>Início *</label>
                    <input value={exp.inicio} onChange={e => updateExp(expIdx, 'inicio', e.target.value)} required placeholder="Jan 2022" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Fim</label>
                    <input value={exp.atual ? '' : exp.fim} onChange={e => updateExp(expIdx, 'fim', e.target.value)} disabled={exp.atual} placeholder={exp.atual ? 'Atual' : 'Dez 2023'} className={`${inputClass} ${exp.atual ? 'bg-gray-100 text-gray-400' : ''}`} />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <input type="checkbox" checked={exp.atual} onChange={e => updateExp(expIdx, 'atual', e.target.checked)} id={`atual-${expIdx}`} className="rounded cursor-pointer accent-indigo-600" />
                    <label htmlFor={`atual-${expIdx}`} className="text-xs text-gray-500 cursor-pointer">Trabalho atual</label>
                  </div>
                </div>

                {/* Funções */}
                <div>
                  <label className={labelClass}>Funções / Atividades</label>
                  <div className="space-y-2">
                    {exp.funcoes.map((func, funcIdx) => (
                      <div key={funcIdx} className="flex items-center gap-2">
                        <span className="text-gray-300 text-xs shrink-0">•</span>
                        <input value={func} onChange={e => updateFunction(expIdx, funcIdx, e.target.value)} placeholder="Descreva uma atividade..." className={`${inputClass} flex-1`} />
                        {exp.funcoes.length > 1 && (
                          <button type="button" onClick={() => removeFunction(expIdx, funcIdx)} className="text-red-300 hover:text-red-500 cursor-pointer text-sm shrink-0">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addFunction(expIdx)} className={addBtn}>
                    + Adicionar função
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addExperience} className={`${addBtn} mt-3`}>
            + Adicionar nova experiência
          </button>
        </div>

        {/* ====== FORMAÇÃO ACADÊMICA ====== */}
        <div>
          <h3 className={sectionHeader}>Formação Acadêmica</h3>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className={cardClass}>
                {education.length > 1 && (
                  <div className="absolute top-3 right-3">
                    <button type="button" onClick={() => removeEducation(idx)} className={removeBtn}>✕ Remover</button>
                  </div>
                )}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Curso *</label>
                    <input value={edu.curso} onChange={e => updateEdu(idx, 'curso', e.target.value)} required placeholder="Administração" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Instituição *</label>
                    <input value={edu.instituicao} onChange={e => updateEdu(idx, 'instituicao', e.target.value)} required placeholder="Universidade / Escola" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ano</label>
                    <input value={edu.ano} onChange={e => updateEdu(idx, 'ano', e.target.value)} placeholder="2020" className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addEducation} className={`${addBtn} mt-2`}>
            + Adicionar formação
          </button>
        </div>

        {/* ====== CURSOS E CERTIFICAÇÕES ====== */}
        <div>
          <h3 className={sectionHeader}>Cursos e Certificações</h3>
          <div className="space-y-3">
            {courses.map((course, idx) => (
              <div key={idx} className={cardClass}>
                {courses.length > 1 && (
                  <div className="absolute top-3 right-3">
                    <button type="button" onClick={() => removeCourse(idx)} className={removeBtn}>✕ Remover</button>
                  </div>
                )}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Nome do curso</label>
                    <input value={course.nome} onChange={e => updateCourse(idx, 'nome', e.target.value)} placeholder="Excel Avançado" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Instituição</label>
                    <input value={course.instituicao} onChange={e => updateCourse(idx, 'instituicao', e.target.value)} placeholder="Senai, Udemy, etc." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ano</label>
                    <input value={course.ano} onChange={e => updateCourse(idx, 'ano', e.target.value)} placeholder="2023" className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addCourse} className={`${addBtn} mt-2`}>
            + Adicionar curso
          </button>
        </div>

        {/* ====== HABILIDADES (Tags) ====== */}
        <div>
          <h3 className={sectionHeader}>Habilidades</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                {skill}
                <button type="button" onClick={() => removeSkill(idx)} className="text-indigo-400 hover:text-indigo-700 cursor-pointer text-sm leading-none">×</button>
              </span>
            ))}
          </div>
          <input
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Digite uma habilidade e pressione Enter..."
            className={inputClass}
          />
          <p className="text-[10px] text-gray-400 mt-1">Pressione Enter ou vírgula para adicionar</p>
        </div>

        {/* ====== IDIOMAS ====== */}
        <div>
          <h3 className={sectionHeader}>Idiomas</h3>
          <div className="space-y-3">
            {languages.map((lang, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Idioma</label>
                  <input value={lang.idioma} onChange={e => updateLang(idx, 'idioma', e.target.value)} placeholder="Inglês" className={inputClass} />
                </div>
                <div className="w-40">
                  <label className={labelClass}>Nível</label>
                  <select value={lang.nivel} onChange={e => updateLang(idx, 'nivel', e.target.value)} className={inputClass}>
                    {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                {languages.length > 1 && (
                  <button type="button" onClick={() => removeLanguage(idx)} className="text-red-300 hover:text-red-500 cursor-pointer text-sm pb-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addLanguage} className={`${addBtn} mt-2`}>
            + Adicionar idioma
          </button>
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.99] transition-all cursor-pointer text-sm shadow-sm">
        ✨ Gerar Currículo Profissional
      </button>
    </form>
  );
}
