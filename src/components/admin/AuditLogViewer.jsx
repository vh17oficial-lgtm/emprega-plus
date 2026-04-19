import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Helper to log admin actions — call from any admin component
export async function logAdminAction(action, details = '') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const ACTION_ICONS = {
    'user.credits': '💰',
    'user.dispatch': '⚡',
    'user.limit': '📊',
    'job.create': '📋',
    'job.delete': '🗑️',
    'config.update': '⚙️',
    'banner.toggle': '📢',
    'maintenance.toggle': '🔧',
    'coupon.create': '🏷️',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📜 Logs de Auditoria</h3>
          <p className="text-sm text-gray-500 mt-1">Carregando...</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">📜 Logs de Auditoria</h3>
        <p className="text-sm text-gray-500 mt-1">Histórico das ações administrativas.</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-sm font-medium">Nenhum log registrado ainda.</p>
          <p className="text-xs mt-1">As ações administrativas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <span className="text-lg mt-0.5">
                {ACTION_ICONS[log.action] || '📝'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                {log.details && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{log.details}</p>
                )}
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                {new Date(log.created_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
