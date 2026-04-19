import { useState } from 'react';
import Button from '../common/Button';
import { JOB_CATEGORIES, WORK_TYPES, JOB_LEVELS, EDUCATION_LEVELS } from '../../data/jobConstants';

export default function JobForm({ job, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    description: job?.description || '',
    category: job?.category || '',
    workType: job?.workType || '',
    level: job?.level || '',
    salary: job?.salary || '',
    cargaHoraria: job?.cargaHoraria || '8 horas/dia',
    escolaridade: job?.escolaridade || '',
    informal: job?.informal || false,
    logo: job?.logo || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';
  const selectClass = `${inputClass} appearance-none cursor-pointer bg-white`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-900">
        {job ? 'Editar Vaga' : 'Nova Vaga'}
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título da Vaga *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ex: Desenvolvedor Frontend"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="Ex: TechNova Solutions"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nicho / Categoria *</label>
          <select name="category" value={form.category} onChange={handleChange} required className={selectClass}>
            <option value="">Selecione...</option>
            {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabalho *</label>
          <select name="workType" value={form.workType} onChange={handleChange} required className={selectClass}>
            <option value="">Selecione...</option>
            {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nível *</label>
          <select name="level" value={form.level} onChange={handleChange} required className={selectClass}>
            <option value="">Selecione...</option>
            {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Escolaridade</label>
          <select name="escolaridade" value={form.escolaridade} onChange={handleChange} className={selectClass}>
            <option value="">Selecione...</option>
            {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          placeholder="Ex: São Paulo, SP"
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salário</label>
          <input
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="Ex: R$ 2.500,00"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária</label>
          <select name="cargaHoraria" value={form.cargaHoraria} onChange={handleChange} className={selectClass}>
            <option value="6 horas/dia">6 horas/dia</option>
            <option value="8 horas/dia">8 horas/dia</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vínculo</label>
          <select
            name="informal"
            value={form.informal ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, informal: e.target.value === 'true' })}
            className={selectClass}
          >
            <option value="false">CLT (carteira assinada)</option>
            <option value="true">Autônomo / Informal</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          placeholder="Descreva a vaga..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit">
          {job ? 'Salvar Alterações' : 'Criar Vaga'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
