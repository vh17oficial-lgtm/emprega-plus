import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const SupportContext = createContext();

function safeLoad(key, fallback) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; }
}
function safeSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const KEYS = {
  conversations: 'emprega_chat_convs',
  messages: 'emprega_chat_msgs',
  adminOnline: 'emprega_chat_admin_online',
  adminLastSeen: 'emprega_chat_admin_seen',
};

const TICKET_TIMEOUT_MS = 5 * 60 * 1000;

export function SupportProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() => safeLoad(KEYS.conversations, []));
  const [messages, setMessages] = useState(() => safeLoad(KEYS.messages, []));
  const [adminOnline, setAdminOnline] = useState(() => safeLoad(KEYS.adminOnline, false));
  const pollRef = useRef(null);

  useEffect(() => { safeSave(KEYS.conversations, conversations); }, [conversations]);
  useEffect(() => { safeSave(KEYS.messages, messages); }, [messages]);

  // Poll localStorage for changes (simulates real-time)
  useEffect(() => {
    pollRef.current = setInterval(() => {
      setConversations(safeLoad(KEYS.conversations, []));
      setMessages(safeLoad(KEYS.messages, []));
      setAdminOnline(safeLoad(KEYS.adminOnline, false));
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, []);

  const setAdminPresence = useCallback((online) => {
    setAdminOnline(online);
    safeSave(KEYS.adminOnline, online);
    if (online) safeSave(KEYS.adminLastSeen, Date.now());
  }, []);

  const getOrCreateConversation = useCallback(() => {
    if (!user) return null;
    const convId = `conv_${user.email}`;
    const stored = safeLoad(KEYS.conversations, []);
    let conv = stored.find((c) => c.id === convId);
    if (!conv) {
      conv = {
        id: convId,
        userId: user.email,
        userName: user.nome || 'Usuário',
        status: 'active',
        lastMessage: '',
        lastMessageAt: null,
        unreadAdmin: 0,
        unreadUser: 0,
        ticketCreated: false,
      };
      const updated = [conv, ...stored];
      safeSave(KEYS.conversations, updated);
      setConversations(updated);
    }
    return conv;
  }, [user]);

  const sendMessage = useCallback((conversationId, text, sender = 'user') => {
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      sender,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const freshMsgs = safeLoad(KEYS.messages, []);
    const updatedMsgs = [...freshMsgs, msg];
    safeSave(KEYS.messages, updatedMsgs);
    setMessages(updatedMsgs);

    const freshConvs = safeLoad(KEYS.conversations, []);
    const updatedConvs = freshConvs.map((c) => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        lastMessage: text.trim(),
        lastMessageAt: msg.timestamp,
        status: 'active',
        unreadAdmin: sender === 'user' ? (c.unreadAdmin || 0) + 1 : 0,
        unreadUser: sender === 'admin' ? (c.unreadUser || 0) + 1 : 0,
      };
    });
    safeSave(KEYS.conversations, updatedConvs);
    setConversations(updatedConvs);
    return msg;
  }, []);

  const markRead = useCallback((conversationId, role) => {
    const freshConvs = safeLoad(KEYS.conversations, []);
    const field = role === 'admin' ? 'unreadAdmin' : 'unreadUser';
    const updatedConvs = freshConvs.map((c) =>
      c.id === conversationId ? { ...c, [field]: 0 } : c
    );
    safeSave(KEYS.conversations, updatedConvs);
    setConversations(updatedConvs);
  }, []);

  const resolveConversation = useCallback((conversationId) => {
    const freshConvs = safeLoad(KEYS.conversations, []);
    const updatedConvs = freshConvs.map((c) =>
      c.id === conversationId ? { ...c, status: 'resolved' } : c
    );
    safeSave(KEYS.conversations, updatedConvs);
    setConversations(updatedConvs);
  }, []);

  const reopenConversation = useCallback((conversationId) => {
    const freshConvs = safeLoad(KEYS.conversations, []);
    const updatedConvs = freshConvs.map((c) =>
      c.id === conversationId ? { ...c, status: 'active' } : c
    );
    safeSave(KEYS.conversations, updatedConvs);
    setConversations(updatedConvs);
  }, []);

  const checkFallback = useCallback((conversationId) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv || conv.ticketCreated || conv.status === 'resolved') return null;

    const convMsgs = messages.filter((m) => m.conversationId === conversationId);
    if (convMsgs.length === 0) return null;

    const lastUserMsg = [...convMsgs].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) return null;

    const lastAdminMsg = [...convMsgs].reverse().find((m) => m.sender === 'admin');
    const lastAdminTime = lastAdminMsg ? new Date(lastAdminMsg.timestamp).getTime() : 0;
    const lastUserTime = new Date(lastUserMsg.timestamp).getTime();

    if (lastUserTime > lastAdminTime && Date.now() - lastUserTime > TICKET_TIMEOUT_MS) {
      const freshConvs = safeLoad(KEYS.conversations, []);
      const updatedConvs = freshConvs.map((c) =>
        c.id === conversationId ? { ...c, ticketCreated: true } : c
      );
      safeSave(KEYS.conversations, updatedConvs);
      setConversations(updatedConvs);
      return true;
    }
    return false;
  }, [conversations, messages]);

  const getMessages = useCallback((conversationId) => {
    return messages.filter((m) => m.conversationId === conversationId);
  }, [messages]);

  const userConversation = user ? conversations.find((c) => c.id === `conv_${user.email}`) : null;
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

export const useSupport = () => useContext(SupportContext);
