import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

        const [
          totalUsers, usersToday, usersWeek,
          totalJobs, activeJobs,
          totalApps, appsToday, appsWeek,
          appsEnviada, appsAnalise, appsPre, appsEncerrada,
          totalConvs, activeConvs, convsData,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
          supabase.from('jobs').select('id', { count: 'exact', head: true }),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'ativa'),
          supabase.from('applications').select('id', { count: 'exact', head: true }),
          supabase.from('applications').select('id', { count: 'exact', head: true }).gte('applied_at', today),
          supabase.from('applications').select('id', { count: 'exact', head: true }).gte('applied_at', weekAgo),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'enviada'),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'em_analise'),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pre_selecionado'),
          supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'encerrada'),
          supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
          supabase.from('chat_conversations').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('chat_conversations').select('unread_admin'),
        ]);

        const unread = (convsData.data || []).reduce((sum, c) => sum + (c.unread_admin || 0), 0);

        setStats({
          totalUsers: totalUsers.count || 0,
          newUsersToday: usersToday.count || 0,
          newUsersWeek: usersWeek.count || 0,
          totalJobs: totalJobs.count || 0,
          activeJobs: activeJobs.count || 0,
          closedJobs: (totalJobs.count || 0) - (activeJobs.count || 0),
          totalApps: totalApps.count || 0,
          appsToday: appsToday.count || 0,
          appsWeek: appsWeek.count || 0,
          appsByStatus: {
            enviada: appsEnviada.count || 0,
            em_analise: appsAnalise.count || 0,
            pre_selecionado: appsPre.count || 0,
            encerrada: appsEncerrada.count || 0,
          },
          totalConvs: totalConvs.count || 0,
          activeConvs: activeConvs.count || 0,
          unreadMessages: unread,
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Erro ao carregar métricas.');
      }
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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📊 Dashboard</h3>
        </div>
        <div className="text-center py-12 text-red-500">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => { setLoading(true); setError(null); }} className="mt-3 text-xs text-indigo-600 hover:underline cursor-pointer">Tentar novamente</button>
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
