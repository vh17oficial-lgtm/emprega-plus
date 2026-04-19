import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { logAdminAction } from './AuditLogViewer';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discount_percent: 10, max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discount_percent: Number(form.discount_percent),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
        active: true,
        used_count: 0,
      };
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) throw error;
      await logAdminAction('coupon.create', `Cupom: ${payload.code} (${payload.discount_percent}%)`);
      setForm({ code: '', discount_percent: 10, max_uses: '', expires_at: '' });
      await load();
    } catch (err) {
      alert('Erro ao criar cupom: ' + err.message);
    }
    setSaving(false);
  };

  const toggleActive = async (coupon) => {
    try {
      const { error } = await supabase.from('coupons').update({ active: !coupon.active }).eq('id', coupon.id);
      if (error) throw error;
      await load();
    } catch (err) {
      alert('Erro ao alterar cupom: ' + err.message);
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!confirm(`Excluir cupom "${coupon.code}"?`)) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
      if (error) throw error;
      await logAdminAction('coupon.delete', `Cupom: ${coupon.code}`);
      await load();
    } catch (err) {
      alert('Erro ao excluir cupom: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">🏷️ Cupons de Desconto</h3>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">🏷️ Cupons de Desconto</h3>
        <p className="text-sm text-gray-500 mt-1">Gerencie cupons promocionais.</p>
      </div>

      {/* Create form */}
      <form onSubmit={create} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-xl">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">CÓDIGO</label>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="PROMO10"
            className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm uppercase"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">DESCONTO %</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">LIMITE DE USOS</label>
          <input
            type="number"
            min={1}
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            placeholder="Ilimitado"
            className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Criando...' : '+ Criar'}
          </button>
        </div>
      </form>

      {/* List */}
      {coupons.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🏷️</div>
          <p className="text-sm">Nenhum cupom criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-bold ${c.active ? 'text-indigo-700' : 'text-gray-400 line-through'}`}>
                  {c.code}
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  {c.discount_percent}% OFF
                </span>
                <span className="text-xs text-gray-500">
                  {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''} usos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(c)}
                  className={`text-xs px-2 py-1 rounded cursor-pointer ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {c.active ? 'Ativo' : 'Inativo'}
                </button>
                <button
                  onClick={() => deleteCoupon(c)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
