import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const SupportContext = createContext();

export function SupportProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminOnline, setAdminOnline] = useState(false);
  const mountedRef = useRef(true);

  // Load all conversations and messages from Supabase
  useEffect(() => {
    mountedRef.current = true;

    async function loadChat() {
      const [convRes, msgRes] = await Promise.all([
        supabase.from('chat_conversations').select('*').order('last_message_at', { ascending: false }),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
      ]);
      if (mountedRef.current) {
        if (convRes.data) setConversations(convRes.data.map(convFromRow));
        if (msgRes.data) setMessages(msgRes.data.map(msgFromRow));
      }
    }

    loadChat();

    // Realtime subscriptions
    const convChannel = supabase.channel('chat-convs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, (payload) => {
        if (!mountedRef.current) return;
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [convFromRow(payload.new), ...prev.filter(c => c.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev => prev.map(c => c.id === payload.new.id ? convFromRow(payload.new) : c));
        } else if (payload.eventType === 'DELETE') {
          setConversations(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    const msgChannel = supabase.channel('chat-msgs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        if (!mountedRef.current) return;
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, msgFromRow(payload.new)];
        });
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(convChannel);
      supabase.removeChannel(msgChannel);
    };
  }, []);

  const setAdminPresence = useCallback((online) => {
    setAdminOnline(online);
  }, []);

  const getOrCreateConversation = useCallback(async () => {
    if (!user) return null;
    const convId = `conv_${user.id}`;
    const existing = conversations.find(c => c.id === convId);
    if (existing) return existing;

    const row = {
      id: convId,
      user_id: user.id,
      user_name: user.nome || 'Usuário',
      status: 'active',
      last_message: '',
      last_message_at: null,
      unread_admin: 0,
      unread_user: 0,
    };
    const { data, error } = await supabase.from('chat_conversations').upsert(row).select().single();
    if (error) { console.error('Erro ao criar conversa:', error.message); return null; }
    const conv = convFromRow(data);
    setConversations(prev => [conv, ...prev.filter(c => c.id !== conv.id)]);
    return conv;
  }, [user, conversations]);

  const sendMessage = useCallback(async (conversationId, text, sender = 'user') => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data: msgData, error: msgErr } = await supabase.from('chat_messages').insert({
      id: msgId,
      conversation_id: conversationId,
      sender,
      text: trimmed,
    }).select().single();

    if (msgErr) { console.error('Erro ao enviar mensagem:', msgErr.message); return null; }

    // Update conversation metadata
    const updates = {
      last_message: trimmed,
      last_message_at: new Date().toISOString(),
      status: 'active',
    };
    if (sender === 'user') {
      updates.unread_admin = (conversations.find(c => c.id === conversationId)?.unreadAdmin || 0) + 1;
      updates.unread_user = 0;
    } else {
      updates.unread_user = (conversations.find(c => c.id === conversationId)?.unreadUser || 0) + 1;
      updates.unread_admin = 0;
    }
    await supabase.from('chat_conversations').update(updates).eq('id', conversationId);

    return msgFromRow(msgData);
  }, [conversations]);

  const markRead = useCallback(async (conversationId, role) => {
    const field = role === 'admin' ? 'unread_admin' : 'unread_user';
    await supabase.from('chat_conversations').update({ [field]: 0 }).eq('id', conversationId);
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, [role === 'admin' ? 'unreadAdmin' : 'unreadUser']: 0 } : c
    ));
  }, []);

  const resolveConversation = useCallback(async (conversationId) => {
    await supabase.from('chat_conversations').update({ status: 'resolved' }).eq('id', conversationId);
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'resolved' } : c
    ));
  }, []);

  const reopenConversation = useCallback(async (conversationId) => {
    await supabase.from('chat_conversations').update({ status: 'active' }).eq('id', conversationId);
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'active' } : c
    ));
  }, []);

  const checkFallback = useCallback(() => null, []);

  const getMessages = useCallback((conversationId) => {
    return messages.filter(m => m.conversationId === conversationId);
  }, [messages]);

  const userConversation = user ? conversations.find(c => c.id === `conv_${user.id}`) : null;
  const userUnread = userConversation?.unreadUser || 0;
  const totalUnreadAdmin = conversations.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0);

  return (
    <SupportContext.Provider value={{
      conversations, messages, adminOnline,
      getOrCreateConversation, sendMessage, getMessages,
      markRead, resolveConversation, reopenConversation,
      setAdminPresence, checkFallback,
      userConversation, userUnread, totalUnreadAdmin,
    }}>
      {children}
    </SupportContext.Provider>
  );
}

// Map DB rows to JS objects
function convFromRow(r) {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || 'Usuário',
    userEmail: r.user_email || '',
    status: r.status || 'active',
    lastMessage: r.last_message || '',
    lastMessageAt: r.last_message_at,
    unreadAdmin: r.unread_admin || 0,
    unreadUser: r.unread_user || 0,
    ticketCreated: !!r.ticket_created,
  };
}

function msgFromRow(r) {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    sender: r.sender,
    text: r.text,
    timestamp: r.created_at,
  };
}

export const useSupport = () => useContext(SupportContext);
