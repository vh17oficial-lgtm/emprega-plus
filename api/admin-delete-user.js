import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify caller JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) return res.status(401).json({ error: 'Token inválido' });

    // Verify caller is admin
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir usuários' });
    }

    const { userId } = req.body;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Prevent self-deletion
    if (userId === caller.id) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
    }

    // Prevent deleting other admins
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, email, nome')
      .eq('id', userId)
      .single();

    if (targetProfile?.role === 'admin') {
      return res.status(400).json({ error: 'Não é possível excluir outro administrador' });
    }

    // Delete from auth (cascades to profiles + related tables via FKs)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('admin-delete-user error:', deleteError);
      return res.status(500).json({ error: deleteError.message || 'Erro ao excluir usuário' });
    }

    // Safety: explicitly delete the profile row in case CASCADE isn't wired
    await supabase.from('profiles').delete().eq('id', userId);

    return res.status(200).json({
      ok: true,
      deleted: { id: userId, email: targetProfile?.email, nome: targetProfile?.nome },
    });
  } catch (err) {
    console.error('admin-delete-user exception:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
