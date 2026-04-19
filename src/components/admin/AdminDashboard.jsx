import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [usersRes, jobsRes, appsRes, convsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at, role', { count: 'exact', head: false }),
        supabase.from('jobs').select('id, status, created_at', { count: 'exact', head: false }),
        supabase.from('applications').select('id, status, applied_at', { count: 'exact', head: false }),
        supabase.from('chat_conversations').select('id, status, unread_admin', { count: 'exact', head: false }),
      ]);

      const users = usersRes.data || [];
      const jobs = jobsRes.data || [];
      const apps = appsRes.data || [];
      const convs = convsRes.data || [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 86400000);

      setStats({
        totalUsers: users.length,
        newUsersToday: users.filter(u => u.created_at && new Date(u.created_at) >= today).length,
        newUsersWeek: users.filter(u => u.created_at && new Date(u.created_at) >= weekAgo).length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'ativa').length,
        closedJobs: jobs.filter(j => j.status !== 'ativa').length,
        totalApps: apps.length,
        appsToday: apps.filter(a => a.applied_at && new Date(a.applied_at) >= today).length,
        appsWeek: apps.filter(a => a.applied_at && new Date(a.applied_at) >= weekAgo).length,
        appsByStatus: {
          enviada: apps.filter(a => a.status === 'enviada').length,
          em_analise: apps.filter(a => a.status === 'em_analise').length,
          pre_selecionado: apps.filter(a => a.status === 'pre_selecionado').length,
          encerrada: apps.filter(a => a.status === 'encerrada').length,
        },
        totalConvs: convs.length,
        activeConvs: convs.filter(c => c.status === 'active').length,
        unreadMessages: convs.reduce((sum, c) => sum + (c.unread_admin || 0), 0),
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📊 Dashboard</h3>
          <p className="text-sm text-gray-500 mt-1">Carregando métricas...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total de Usuários', value: stats.totalUsers, sub: `+${stats.newUsersToday} hoje · +${stats.newUsersWeek} semana`, icon: '👥', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Vagas Ativas', value: stats.activeJobs, sub: `${stats.totalJobs} total · ${stats.closedJobs} encerradas`, icon: '📋', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Candidaturas', value: stats.totalApps, sub: `+${stats.appsToday} hoje · +${stats.appsWeek} semana`, icon: '📨', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Chat Suporte', value: stats.activeConvs, sub: `${stats.unreadMessages} não lida(s) · ${stats.totalConvs} total`, icon: '💬', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  const statusBar = [
    { label: 'Enviadas', value: stats.appsByStatus.enviada, color: 'bg-emerald-500' },
    { label: 'Em análise', value: stats.appsByStatus.em_analise, color: 'bg-blue-500' },
    { label: 'Pré-selecionadas', value: stats.appsByStatus.pre_selecionado, color: 'bg-green-500' },
    { label: 'Encerradas', value: stats.appsByStatus.encerrada, color: 'bg-gray-400' },
  ];
  const totalForBar = Math.max(statusBar.reduce((s, b) => s + b.value, 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">📊 Dashboard</h3>
        <p className="text-sm text-gray-500 mt-1">Visão geral da plataforma em tempo real.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-2xl font-bold">{c.value}</span>
            </div>
            <p className="text-xs font-semibold">{c.label}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Applications status bar */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Status das Candidaturas</h4>
        <div className="flex rounded-full overflow-hidden h-4 bg-gray-100">
          {statusBar.map((s) => (
            s.value > 0 && (
              <div
                key={s.label}
                className={`${s.color} transition-all`}
                style={{ width: `${(s.value / totalForBar) * 100}%` }}
                title={`${s.label}: ${s.value}`}
              />
            )
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {statusBar.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-xs text-gray-600">{s.label}: <strong>{s.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
