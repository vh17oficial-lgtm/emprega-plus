import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Clock, Headphones } from 'lucide-react';
import { useSupport } from '../../context/SupportContext';
import { useAuth } from '../../context/AuthContext';

const QUICK_REPLIES = [
  { label: '💳 Pagamento', text: 'Preciso de ajuda com pagamento' },
  { label: '📄 Currículo', text: 'Tenho uma dúvida sobre currículo' },
  { label: '📬 Candidaturas', text: 'Preciso de ajuda com candidaturas' },
  { label: '👤 Minha conta', text: 'Preciso de ajuda com minha conta' },
];

const WELCOME_MSG = {
  id: 'welcome',
  sender: 'admin',
  text: 'Olá! 👋 Bem-vindo ao suporte Emprega+.\nComo posso te ajudar hoje?',
  timestamp: null,
  isWelcome: true,
};

export default function SupportWidget() {
  const { user } = useAuth();
  const {
    adminOnline, getOrCreateConversation, sendMessage,
    getMessages, markRead, checkFallback, userConversation, userUnread,
  } = useSupport();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [fallbackShown, setFallbackShown] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fallbackCheckRef = useRef(null);
  const prevMsgCount = useRef(0);

  const conv = userConversation;
  const convMessages = conv ? getMessages(conv.id) : [];

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, open, typing]);

  // Simulate typing indicator when admin sends a message
  useEffect(() => {
    if (convMessages.length > prevMsgCount.current) {
      const newest = convMessages[convMessages.length - 1];
      if (newest?.sender === 'admin') setTyping(false);
    }
    prevMsgCount.current = convMessages.length;
  }, [convMessages.length]);

  // Mark as read when chat is open
  useEffect(() => {
    if (open && conv && conv.unreadUser > 0) markRead(conv.id, 'user');
  }, [open, conv?.unreadUser]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Check for fallback every 30s
  useEffect(() => {
    if (!conv) return;
    fallbackCheckRef.current = setInterval(() => {
      const result = checkFallback(conv.id);
      if (result) setFallbackShown(true);
    }, 30000);
    return () => clearInterval(fallbackCheckRef.current);
  }, [conv?.id, checkFallback]);

  const handleOpen = () => {
    getOrCreateConversation();
    setOpen(true);
  };

  const handleSend = useCallback((msgText) => {
    const finalText = msgText || text;
    if (!finalText.trim() || !conv) return;
    sendMessage(conv.id, finalText.trim(), 'user');
    setText('');
  }, [text, conv, sendMessage]);

  const handleQuickReply = (qr) => {
    if (!conv) return;
    sendMessage(conv.id, qr.text, 'user');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSep = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // Build display messages: welcome + real messages
  const displayMessages = [];
  let lastDate = '';

  // Always show welcome as first
  displayMessages.push({ type: 'msg', ...WELCOME_MSG });

  convMessages.forEach((msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (date !== lastDate) {
      displayMessages.push({ type: 'date', date: msg.timestamp, id: `d-${date}` });
      lastDate = date;
    }
    displayMessages.push({ type: 'msg', ...msg });
  });

  const showQuickReplies = convMessages.length === 0;
  const firstName = user?.nome?.split(' ')[0] || '';

  if (!user) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={handleOpen}
        className={`chat-fab fixed z-50 group flex items-center gap-2.5 rounded-full shadow-xl transition-all duration-300 cursor-pointer
          bottom-20 right-4 lg:bottom-6 lg:right-6
          ${open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Abrir chat"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />

        <span className="relative z-10 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white pl-4 pr-5 py-3 rounded-full transition-all">
          <Headphones className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Suporte</span>
        </span>

        {/* Status dot */}
        <span className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white z-20 ${adminOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />

        {/* Unread badge */}
        {userUnread > 0 && (
          <span className="absolute -top-1.5 -left-1 min-w-[22px] h-[22px] flex items-center justify-center px-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full border-2 border-white z-20 animate-bounce">
            {userUnread}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden animate-[chatOpen_300ms_cubic-bezier(0.16,1,0.3,1)]
            inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[560px] sm:rounded-2xl
            shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)]"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* ── Header ── */}
          <div className="relative shrink-0 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="relative flex items-center gap-3 px-4 py-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 ${adminOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Emprega+ Suporte</h3>
                <p className="text-[11px] mt-0.5 font-medium">
                  {adminOnline ? (
                    <span className="text-emerald-300">🟢 Online agora · Respondemos em minutos</span>
                  ) : (
                    <span className="text-amber-300">🟡 Ausente · Deixe sua mensagem</span>
                  )}
                </p>
              </div>

              <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Messages Area ── */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 chat-messages-bg">
            {displayMessages.map((item, i) => {
              if (item.type === 'date') {
                return (
                  <div key={item.id} className="flex justify-center py-2.5">
                    <span className="bg-indigo-900/60 text-indigo-200 text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                      {formatDateSep(item.date)}
                    </span>
                  </div>
                );
              }

              const isUser = item.sender === 'user';
              const isWelcome = item.isWelcome;

              return (
                <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1.5 animate-[msgFade_300ms_ease-out]`}>
                  {/* Admin avatar */}
                  {!isUser && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mr-2 mt-auto mb-1 shadow-sm">
                      <Headphones className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={`relative max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed
                    ${isUser
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-indigo-500/20'
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-white/50'
                    }`}
                  >
                    {!isUser && !isWelcome && (
                      <p className="text-[10px] font-bold text-indigo-500 mb-0.5">Suporte Emprega+</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{item.text}</p>
                    {item.timestamp && (
                      <p className={`text-[10px] mt-1 text-right ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formatTime(item.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick replies */}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-1.5 pl-9 pt-1 animate-[msgFade_400ms_ease-out_200ms_both]">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => handleQuickReply(qr)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-indigo-300/50 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/25 hover:border-indigo-400/60 transition-all cursor-pointer backdrop-blur-sm"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start mb-1.5 animate-[msgFade_200ms_ease-out]">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mr-2 mt-auto mb-1">
                  <Headphones className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-white/50">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typingDot_1.4s_ease-in-out_infinite]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typingDot_1.4s_ease-in-out_0.2s_infinite]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typingDot_1.4s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              </div>
            )}

            {/* Fallback ticket notice */}
            {(fallbackShown || conv?.ticketCreated) && (
              <div className="flex justify-center py-3 animate-[msgFade_400ms_ease-out]">
                <div className="bg-amber-500/15 border border-amber-400/30 backdrop-blur-sm rounded-xl px-4 py-3 text-center max-w-[85%]">
                  <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                  <p className="text-xs text-amber-200 font-semibold">Mensagem salva como ticket</p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">Responderemos assim que possível.</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="shrink-0 bg-[#1a1d2e] border-t border-white/5 px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva sua mensagem..."
                rows={1}
                className="flex-1 resize-none outline-none text-sm text-white placeholder:text-gray-500 max-h-24 py-2.5 px-4 rounded-2xl bg-white/10 border border-white/10 focus:border-indigo-500/50 focus:bg-white/15 transition-all"
                style={{ minHeight: '42px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!text.trim()}
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${text.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-90'
                    : 'bg-white/10 text-gray-600 cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-1.5">
              Powered by <span className="font-semibold text-indigo-400">Emprega+</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
