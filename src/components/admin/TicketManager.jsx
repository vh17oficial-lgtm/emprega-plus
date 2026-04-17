import { useState, useRef, useEffect } from 'react';
import { useSupport } from '../../context/SupportContext';
import { Send, CheckCircle, MessageCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function TicketManager() {
  const {
    conversations, adminOnline, getMessages, sendMessage,
    markRead, resolveConversation, reopenConversation,
    setAdminPresence, totalUnreadAdmin,
  } = useSupport();

  const [selectedConvId, setSelectedConvId] = useState(null);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Set admin online when this component mounts
  useEffect(() => {
    setAdminPresence(true);
    return () => setAdminPresence(false);
  }, [setAdminPresence]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const convMessages = selectedConvId ? getMessages(selectedConvId) : [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, selectedConvId]);

  // Mark read when selecting conversation
  useEffect(() => {
    if (selectedConvId && selectedConv?.unreadAdmin > 0) {
      markRead(selectedConvId, 'admin');
    }
  }, [selectedConvId, selectedConv?.unreadAdmin]);

  // Focus input
  useEffect(() => {
    if (selectedConvId) setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedConvId]);

  const handleSend = () => {
    if (!text.trim() || !selectedConvId) return;
    sendMessage(selectedConvId, text.trim(), 'admin');
    setText('');
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

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

  const filtered = filter === 'all'
    ? conversations
    : conversations.filter((c) => c.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });

  // Group messages by date
  const groupedMessages = [];
  let lastDate = '';
  convMessages.forEach((msg) => {
    const date = new Date(msg.timestamp).toDateString();
    if (date !== lastDate) {
      groupedMessages.push({ type: 'date', date: msg.timestamp, id: `d-${date}` });
      lastDate = date;
    }
    groupedMessages.push({ type: 'msg', ...msg });
  });

  const activeCount = conversations.filter((c) => c.status === 'active').length;
  const resolvedCount = conversations.filter((c) => c.status === 'resolved').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Chat ao Vivo</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {adminOnline ? (
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" /> Você está online</span>
            ) : (
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 bg-gray-400 rounded-full inline-block" /> Offline</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{activeCount} ativas</span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{resolvedCount} resolvidas</span>
          {totalUnreadAdmin > 0 && (
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">{totalUnreadAdmin} não lida(s)</span>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden" style={{ height: '520px' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`${selectedConvId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 border-r border-gray-200 bg-white`}>
            {/* Filter tabs */}
            <div className="flex border-b border-gray-100 px-2 pt-2">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'active', label: 'Ativas' },
                { key: 'resolved', label: 'Resolvidas' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 text-xs font-medium py-2 rounded-t-lg transition-colors cursor-pointer ${
                    filter === f.key ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-40" />
                  Nenhuma conversa
                </div>
              ) : (
                sorted.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 transition-colors cursor-pointer ${
                      selectedConvId === conv.id ? 'bg-emerald-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                      {conv.userName?.charAt(0)?.toUpperCase() || '?'}
                      {conv.status === 'active' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate">{conv.userName}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{formatDate(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || 'Nova conversa'}</p>
                    </div>
                    {(conv.unreadAdmin || 0) > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full">
                        {conv.unreadAdmin}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`${selectedConvId ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-gray-50`}>
            {!selectedConvId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Selecione uma conversa</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="lg:hidden p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                    {selectedConv?.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedConv?.userName}</p>
                    <p className="text-[11px] text-gray-500">{selectedConv?.userId}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedConv?.status === 'active' ? (
                      <button
                        onClick={() => resolveConversation(selectedConvId)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolver
                      </button>
                    ) : (
                      <button
                        onClick={() => reopenConversation(selectedConvId)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reabrir
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5e7eb\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundColor: '#f0f2f5' }}
                >
                  {groupedMessages.map((item) => {
                    if (item.type === 'date') {
                      return (
                        <div key={item.id} className="flex justify-center py-2">
                          <span className="bg-white/80 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                            {formatDateSep(item.date)}
                          </span>
                        </div>
                      );
                    }
                    const isAdmin = item.sender === 'admin';
                    return (
                      <div key={item.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-1`}>
                        <div className={`relative max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm
                          ${isAdmin
                            ? 'bg-emerald-500 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                          }`}
                        >
                          {!isAdmin && (
                            <p className="text-[10px] font-semibold text-indigo-500 mb-0.5">{selectedConv?.userName}</p>
                          )}
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{item.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {formatTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2.5 flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite uma resposta..."
                    rows={1}
                    className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 max-h-20 py-2.5 px-3 rounded-2xl bg-gray-100 focus:bg-gray-50 focus:ring-1 focus:ring-emerald-300 transition-colors"
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer
                      ${text.trim()
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
