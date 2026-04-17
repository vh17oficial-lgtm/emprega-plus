import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';
import JobForm from './JobForm';

const workTypeBadge = {
  'Presencial': 'bg-blue-50 text-blue-700',
  'Home Office': 'bg-emerald-50 text-emerald-700',
  'Híbrido': 'bg-purple-50 text-purple-700',
};

export default function JobManager() {
  const { jobs, addJob, editJob, deleteJob, closeJob, reopenJob } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [adminPage, setAdminPage] = useState(1);
  const ADMIN_PER_PAGE = 15;
  const adminTotalPages = Math.ceil(jobs.length / ADMIN_PER_PAGE);
  const pagedJobs = jobs.slice((adminPage - 1) * ADMIN_PER_PAGE, adminPage * ADMIN_PER_PAGE);

  const handleSave = (data) => {
    if (editingJob) {
      editJob(editingJob.id, data);
    } else {
      addJob(data);
    }
    setShowForm(false);
    setEditingJob(null);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      deleteJob(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Vagas Cadastradas</h3>
          <p className="text-sm text-gray-500">{jobs.length} vaga(s) no total</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setEditingJob(null); setShowForm(true); }}>
            + Adicionar Vaga
          </Button>
        )}
      </div>

      {showForm && (
        <JobForm
          job={editingJob}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="space-y-3">
        {pagedJobs.map((job) => (
          <div
            key={job.id}
            className={`bg-white border rounded-xl p-4 transition-colors ${
              job.status === 'encerrada' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                  {job.status === 'encerrada' ? (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 shrink-0">Encerrada</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">Ativa</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {job.company} • {job.location}
                  {job.salary ? ` • ${job.salary}` : ''}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {job.category && (
                    <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{job.category}</span>
                  )}
                  {job.workType && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${workTypeBadge[job.workType] || 'bg-gray-50 text-gray-600'}`}>{job.workType}</span>
                  )}
                  {job.level && (
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{job.level}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {job.status === 'encerrada' ? (
                  <Button variant="secondary" onClick={() => reopenJob(job.id)} className="!py-1.5 !px-3 !text-xs">
                    🔄 Reabrir
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => {
                    if (confirm('Encerrar esta vaga? Candidaturas vinculadas serão marcadas como encerradas.')) closeJob(job.id);
                  }} className="!py-1.5 !px-3 !text-xs !bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-100">
                    ⛔ Encerrar
                  </Button>
                )}
                <Button variant="secondary" onClick={() => handleEdit(job)} className="!py-1.5 !px-3 !text-xs">
                  ✏️ Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(job.id)} className="!py-1.5 !px-3 !text-xs">
                  🗑️ Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {adminTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setAdminPage(p => Math.max(1, p - 1))}
            disabled={adminPage === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-xs text-gray-500">Página {adminPage} de {adminTotalPages}</span>
          <button
            onClick={() => setAdminPage(p => Math.min(adminTotalPages, p + 1))}
            disabled={adminPage === adminTotalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
