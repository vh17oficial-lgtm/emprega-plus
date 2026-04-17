import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const STATUS_OPTIONS = [
  { value: 'enviada', label: 'Enviada', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'em_analise', label: 'Em análise', color: 'bg-blue-100 text-blue-700' },
  { value: 'pre_selecionado', label: 'Pré-selecionado', color: 'bg-green-100 text-green-700' },
  { value: 'encerrada', label: 'Encerrada', color: 'bg-gray-200 text-gray-600' },
];

export default function ApplicationManager() {
  const { getAllApplications, getUserName, updateApplicationStatus, bulkUpdateApplicationStatus, jobs } = useAppContext();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const allApplications = useMemo(() => getAllApplications(), [refreshKey, jobs]); // eslint-disable-line

  const filtered = useMemo(() => {
    return allApplications.filter(app => {
      if (filterStatus && app.status !== filterStatus) return false;
      if (filterJob && app.jobId !== Number(filterJob)) return false;
      if (filterUser && !getUserName(app.userId).toLowerCase().includes(filterUser.toLowerCase())) return false;
      return true;
    });
  }, [allApplications, filterStatus, filterJob, filterUser]); // eslint-disable-line

  const uniqueJobs = useMemo(() => {
    const map = new Map();
    allApplications.forEach(a => { if (!map.has(a.jobId)) map.set(a.jobId, a.jobTitle); });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [allApplications]);

  const toggleSelect = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => `${a.userId}_${a.jobId}`)));
    }
  };

  const handleStatusChange = (userId, jobId, newStatus) => {
    updateApplicationStatus(userId, jobId, newStatus);
    setRefreshKey(k => k + 1);
  };

  const handleBulkUpdate = () => {
    if (!bulkStatus || selected.size === 0) return;
    const updates = [];
    selected.forEach(key => {
      const [uid, jid] = key.split('_');
      updates.push({ userId: uid, jobId: Number(jid), newStatus: bulkStatus });
    });
    bulkUpdateApplicationStatus(updates);
    setSelected(new Set());
    setBulkStatus('');
    setRefreshKey(k => k + 1);
  };

  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${opt.color}`}>{opt.label}</span>;
  };

  const stats = useMemo(() => {
    const s = { enviada: 0, em_analise: 0, pre_selecionado: 0, encerrada: 0, total: allApplications.length };
    allApplications.forEach(a => { s[a.status] = (s[a.status] || 0) + 1; });
    return s;
  }, [allApplications]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Candidaturas</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as candidaturas dos usuários</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{stats.enviada}</p>
          <p className="text-xs text-emerald-600">Enviadas</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.em_analise}</p>
          <p className="text-xs text-blue-600">Em análise</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.pre_selecionado}</p>
          <p className="text-xs text-green-600">Pré-selecionados</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.encerrada}</p>
          <p className="text-xs text-gray-500">Encerradas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Filtrar por status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
              <option value="">Todos</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Filtrar por vaga</label>
            <select value={filterJob} onChange={e => setFilterJob(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2">
              <option value="">Todas</option>
              {uniqueJobs.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Buscar usuário</label>
            <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="Nome do usuário..." className="w-full text-sm border rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium text-indigo-700">{selected.size} selecionada(s)</span>
          <div className="flex items-center gap-2 flex-1">
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="text-sm border rounded-lg px-3 py-2">
              <option value="">Alterar status para...</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={handleBulkUpdate} disabled={!bulkStatus} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              Aplicar
            </button>
            <button onClick={() => setSelected(new Set())} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Nenhuma candidatura encontrada</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded cursor-pointer" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaga</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => {
                  const key = `${app.userId}_${app.jobId}`;
                  return (
                    <tr key={key} className={`hover:bg-gray-50 ${selected.has(key) ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSelect(key)} className="rounded cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{getUserName(app.userId)}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.jobCompany}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={app.rawStatus}
                          onChange={e => handleStatusChange(app.userId, app.jobId, e.target.value)}
                          className="text-xs border rounded px-2 py-1.5 cursor-pointer bg-white"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t px-4 py-3 bg-gray-50 text-xs text-gray-500">
            Mostrando {filtered.length} de {allApplications.length} candidaturas
          </div>
        </div>
      )}
    </div>
  );
}
