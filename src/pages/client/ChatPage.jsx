import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Compass,
  Briefcase,
  Coins,
  Heart,
  Orbit,
  Calendar,
  MapPin,
  Clock,
  X,
  Search,
  PanelRightClose,
  PanelRightOpen,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context';
import { ROUTES } from '../../router/routes';
import { navigate } from '../../router';
import {
  SUGGESTED_QUESTIONS,
} from '../../data/chatMockData';
import {
  loadSavedConversations,
  persistConversations,
  dispatchMessageToAssistant,
} from '../../services/chatDemoService';
import {
  ASCENDANT_DATA,
} from '../../data/kundliMockData';
import {
  VIMSHOTTARI_DASHA_DATA,
  GOCHARA_TRANSITS_DATA,
} from '../../data/predictionsMockData';

const MAX_CHAR_LIMIT = 1000;

const CATEGORY_ICON_MAP = {
  Briefcase: Briefcase,
  Coins: Coins,
  Heart: Heart,
  Orbit: Orbit,
  Compass: Compass,
};

const ChatPage = () => {
  const { user } = useAuth();

  // Conversations State
  const [conversations, setConversations] = useState(loadSavedConversations);
  const [activeConversationId, setActiveConversationId] = useState(() => {
    const loaded = loadSavedConversations();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  // UI Interactive States
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(true);
  const [isContextDrawerMobile, setIsContextDrawerMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Active Conversation Object
  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ||
      conversations[0] ||
      null
    );
  }, [conversations, activeConversationId]);

  // Persist conversations to sessionStorage on every change
  useEffect(() => {
    persistConversations(conversations);
  }, [conversations]);

  // Scroll to bottom when messages update or thinking state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputMessage]);

  // Filtered Conversations for Sidebar Search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Action: Create New Conversation
  const handleCreateNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setIsSidebarOpenMobile(false);
    setInputMessage('');
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Action: Delete Conversation
  const confirmDeleteConversation = () => {
    if (!conversationToDelete) return;
    const remaining = conversations.filter((c) => c.id !== conversationToDelete.id);
    setConversations(remaining);

    if (activeConversationId === conversationToDelete.id) {
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        // Create an empty conversation if all were deleted
        const fallbackId = `conv-${Date.now()}`;
        const fallbackConv = {
          id: fallbackId,
          title: 'New Consultation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        setConversations([fallbackConv]);
        setActiveConversationId(fallbackId);
      }
    }
    setConversationToDelete(null);
  };

  // Action: Submit Message
  const handleSendMessage = async (textToSend = null, suggestionId = null) => {
    const query = (textToSend !== null ? textToSend : inputMessage).trim();
    if (!query || isThinking) return;

    if (query.length > MAX_CHAR_LIMIT) return;

    // Target Conversation
    let targetConvId = activeConversationId;
    let targetConv = activeConversation;

    if (!targetConv) {
      targetConvId = `conv-${Date.now()}`;
      targetConv = {
        id: targetConvId,
        title: query.slice(0, 36) + (query.length > 36 ? '...' : ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setConversations((prev) => [targetConv, ...prev]);
      setActiveConversationId(targetConvId);
    }

    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      source: 'user',
    };

    // Update conversation with user message immediately
    const updatedMessages = [...(targetConv.messages || []), userMessage];
    const newTitle =
      targetConv.title === 'New Consultation' || targetConv.messages.length === 0
        ? query.length > 36
          ? `${query.slice(0, 36)}...`
          : query
        : targetConv.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setInputMessage('');
    setIsThinking(true);

    try {
      // Simulate Assistant Response through Service
      const assistantMessage = await dispatchMessageToAssistant({
        userQuery: query,
        suggestionId,
        delayMs: 800,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, assistantMessage],
              }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to dispatch demo message:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Action: Regenerate Latest Response
  const handleRegenerateResponse = async () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isThinking) return;

    const msgs = [...activeConversation.messages];
    let lastUserQuery = '';
    let suggestionKey = null;

    // Find the last user query
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserQuery = msgs[i].content;
        break;
      }
    }

    if (!lastUserQuery) return;

    // Remove trailing assistant message if present
    if (msgs[msgs.length - 1].role === 'assistant') {
      suggestionKey = msgs[msgs.length - 1].metadata?.topicKey || null;
      msgs.pop();
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: msgs }
          : c
      )
    );

    setIsThinking(true);

    try {
      const regeneratedAssistant = await dispatchMessageToAssistant({
        userQuery: lastUserQuery,
        suggestionId: suggestionKey,
        delayMs: 700,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                updatedAt: new Date().toISOString(),
                messages: [...msgs, regeneratedAssistant],
              }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to regenerate response:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Action: Copy Message Text
  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Keyboard handler for composer
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-4">
        {/* ========================================================= */}
        {/* TOP BAR / PAGE HEADER                                      */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gold/15">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gold/25 to-purple/30 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-purple/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Veda AI Conversational Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Classical Jyotish Synthesizer
                </span>
              </div>
              <p className="text-xs text-mutedtext mt-0.5">
                Consult classical Parashara and Jaimini Vedic texts on your birth chart, planetary transits, and dasha cycles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpenMobile(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gold/25 bg-gold/10 text-xs font-semibold text-lightgold hover:bg-gold/20 transition-all"
              aria-label="Open conversation history"
            >
              <MessageSquare className="h-4 w-4" />
              <span>History</span>
            </button>

            {/* Mobile Context Panel Toggle */}
            <button
              type="button"
              onClick={() => setIsContextDrawerMobile(true)}
              className="xl:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gold/25 bg-gold/10 text-xs font-semibold text-lightgold hover:bg-gold/20 transition-all"
              aria-label="View birth context"
            >
              <Compass className="h-4 w-4" />
              <span>Kundli Context</span>
            </button>

            {/* Desktop Context Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}
              className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isContextPanelOpen
                  ? 'border-gold/40 bg-gold/15 text-lightgold shadow-sm shadow-gold/20'
                  : 'border-gold/20 bg-white/5 text-mutedtext hover:text-white hover:border-gold/30'
              }`}
              title={isContextPanelOpen ? 'Collapse Astrological Context' : 'Expand Astrological Context'}
            >
              {isContextPanelOpen ? (
                <>
                  <PanelRightClose className="h-4 w-4 text-gold" />
                  <span>Hide Context</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-4 w-4 text-lightgold" />
                  <span>Show Context</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CHAT APPLICATION CONTAINER                           */}
        {/* ========================================================= */}
        <div className="relative flex rounded-3xl border border-gold/20 bg-[#080514]/90 backdrop-blur-xl shadow-2xl shadow-purple/25 overflow-hidden h-[760px] max-h-[82vh]">
          {/* ======================================================= */}
          {/* AREA A: CONVERSATION SIDEBAR (DESKTOP)                  */}
          {/* ======================================================= */}
          <aside className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col border-r border-gold/15 bg-[#060411]/95 z-10">
            {/* Sidebar Top: New Chat CTA */}
            <div className="p-3.5 border-b border-gold/15 space-y-3">
              <button
                type="button"
                onClick={handleCreateNewChat}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold/25 via-gold/15 to-purple/25 hover:from-gold/35 hover:to-purple/35 border border-gold/40 text-lightgold text-xs font-semibold shadow-md shadow-gold/10 transition-all hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4 text-gold" />
                <span>New Consultation</span>
              </button>

              {/* Search Conversations */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mutedtext" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search consultations..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-gold/15 text-xs text-white placeholder-mutedtext/60 focus:outline-none focus:border-gold/40 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mutedtext hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-mutedtext/70 flex items-center justify-between">
                <span>Recent Inquiries</span>
                <span>{filteredConversations.length}</span>
              </div>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageSquare className="h-8 w-8 text-mutedtext/30 mx-auto mb-2" />
                  <p className="text-xs text-mutedtext">
                    {searchQuery ? 'No matching consultations.' : 'No consultations yet.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[11px] text-lightgold mt-1 underline hover:text-gold"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const lastMsg =
                    conv.messages && conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1]
                      : null;

                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        isActive
                          ? 'border-gold/40 bg-gold/15 shadow-md shadow-purple/15 text-white'
                          : 'border-transparent hover:border-gold/20 hover:bg-white/5 text-mutedtext'
                      }`}
                      onClick={() => setActiveConversationId(conv.id)}
                    >
                      <MessageSquare
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          isActive ? 'text-gold' : 'text-mutedtext group-hover:text-lightgold'
                        }`}
                      />

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-medium truncate block ${
                              isActive ? 'text-white font-semibold' : 'text-mutedtext group-hover:text-white'
                            }`}
                          >
                            {conv.title}
                          </span>
                        </div>

                        <p className="text-[11px] text-mutedtext/70 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : 'Empty consultation'}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-mutedtext/60">
                          <span>{formatDate(conv.updatedAt)}</span>
                          <span>&bull;</span>
                          <span>{conv.messages.length} msg{conv.messages.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>

                      {/* Delete Conversation Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(conv);
                        }}
                        className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-mutedtext hover:text-red-300 transition-all"
                        title="Delete Consultation"
                        aria-label="Delete consultation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Status */}
            <div className="p-3 border-t border-gold/15 bg-black/30 text-[10px] text-mutedtext/70 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Browser Session Storage
              </span>
              <span className="font-mono text-lightgold/70">Demo v1.0</span>
            </div>
          </aside>

          {/* ======================================================= */}
          {/* AREA B: MAIN CHAT WINDOW                                */}
          {/* ======================================================= */}
          <section className="flex-1 flex flex-col min-w-0 bg-[#05040B]/70 relative">
            {/* Chat Top Banner */}
            <div className="px-4 sm:px-6 py-3 border-b border-gold/15 bg-[#080514]/90 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-gold/20 to-purple/40 border border-gold/40 flex items-center justify-center text-gold shadow-sm shadow-purple/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#080514]" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-display text-sm sm:text-base font-semibold text-white truncate">
                    {activeConversation?.title || 'New Consultation'}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-mutedtext">
                    <span className="text-lightgold font-medium">Veda AI Guide</span>
                    <span>&bull;</span>
                    <span className="truncate">Parashara &bull; Jaimini &bull; Vimshottari Dasha</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  className="sm:hidden p-2 rounded-xl border border-gold/20 bg-white/5 text-lightgold hover:bg-gold/15"
                  title="New Consultation"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
              {/* IF NO MESSAGES: RENDER WELCOME SCREEN */}
              {(!activeConversation || activeConversation.messages.length === 0) && (
                <div className="max-w-3xl mx-auto py-4 space-y-8 animate-fadeIn">
                  {/* Welcome Greeting */}
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-tr from-gold/20 via-purple/30 to-gold/10 border border-gold/40 text-gold shadow-xl shadow-purple/25 mb-1">
                      <Sparkles className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                      Namaste, {user?.displayName || user?.name || 'Seeker'}
                    </h3>
                    <p className="text-sm text-mutedtext max-w-xl mx-auto font-serif leading-relaxed">
                      Welcome to your personal Vedic Astrology consultation. Ask questions regarding your Kundli, planetary alignments, Dasha periods, career, finance, or relationship guidance.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold/15 text-xs text-lightgold">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                      <span>Aligned with your saved Birth Profile &amp; Lahiri Ayanamsha</span>
                    </div>
                  </div>

                  {/* Suggested Question Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-semibold text-white tracking-wider uppercase text-[11px] text-lightgold flex items-center gap-2">
                        <Flame className="h-3.5 w-3.5 text-gold" />
                        <span>Suggested Inquiries for Today</span>
                      </h4>
                      <span className="text-[11px] text-mutedtext">Click to submit instantly</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {SUGGESTED_QUESTIONS.map((cat) => {
                        const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Sparkles;
                        return (
                          <div
                            key={cat.category}
                            className="p-3.5 rounded-2xl border border-gold/20 bg-gradient-to-b from-[#0b0819] to-[#070512] hover:border-gold/40 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold text-lightgold mb-2.5 pb-2 border-b border-gold/10">
                              <IconComponent className="h-4 w-4 text-gold" />
                              <span>{cat.category}</span>
                            </div>

                            <div className="space-y-2">
                              {cat.questions.map((q) => (
                                <button
                                  key={q.id}
                                  type="button"
                                  onClick={() => handleSendMessage(q.text, q.id)}
                                  className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-gold/15 border border-gold/10 hover:border-gold/30 text-xs text-white/90 hover:text-white transition-all flex items-center justify-between group"
                                >
                                  <span className="truncate pr-2 font-serif text-[12px]">{q.text}</span>
                                  <ArrowRight className="h-3 w-3 text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MESSAGES LIST */}
              {activeConversation &&
                activeConversation.messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isLatestAssistant =
                    !isUser && index === activeConversation.messages.length - 1;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
                    >
                      {/* USER MESSAGE BUBBLE */}
                      {isUser ? (
                        <div className="max-w-xl sm:max-w-2xl rounded-2xl rounded-tr-sm bg-gradient-to-r from-gold/15 via-[#1a1236] to-purple/25 border border-gold/35 p-4 text-white shadow-lg shadow-purple/15">
                          <p className="text-sm font-serif leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-mono text-lightgold/70">
                            <span>You</span>
                            <span>&bull;</span>
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      ) : (
                        /* ASSISTANT MESSAGE CARD */
                        <div className="max-w-2xl sm:max-w-3xl w-full rounded-2xl rounded-tl-sm bg-[#0a071a]/95 border border-gold/25 p-4 sm:p-5 text-white shadow-xl shadow-purple/20 space-y-4">
                          {/* Assistant Card Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-gold/15">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                                <Sparkles className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <span className="font-display text-xs font-semibold text-white">
                                  Veda AI Jyotish Synthesis
                                </span>
                                {msg.title && (
                                  <span className="text-[11px] text-lightgold/80 block font-serif">
                                    {msg.title}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-mutedtext/70">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>

                          {/* Assistant Message Body */}
                          <div className="text-sm font-serif leading-relaxed text-neutral-200 space-y-3 prose-invert">
                            {/* Render formatted markdown-like text */}
                            {msg.content.split('\n\n').map((paragraph, pIdx) => {
                              if (paragraph.startsWith('### ')) {
                                return (
                                  <h4
                                    key={pIdx}
                                    className="font-display text-xs font-semibold text-lightgold tracking-wide uppercase pt-2"
                                  >
                                    {paragraph.replace('### ', '')}
                                  </h4>
                                );
                              }
                              if (paragraph.startsWith('> ')) {
                                return (
                                  <blockquote
                                    key={pIdx}
                                    className="border-l-2 border-gold/50 pl-3 py-1 italic text-lightgold/90 bg-gold/5 rounded-r-lg font-serif text-xs"
                                  >
                                    {paragraph.replace('> ', '')}
                                  </blockquote>
                                );
                              }
                              return (
                                <p key={pIdx} className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                                  {paragraph}
                                </p>
                              );
                            })}
                          </div>

                          {/* Upaya / Remedial Callout (if present) */}
                          {msg.upaya && (
                            <div className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-display text-[11px] font-semibold text-lightgold uppercase tracking-wider">
                                <Flame className="h-3.5 w-3.5 text-gold" />
                                <span>Classical Remedial Suggestion (Upaya)</span>
                              </div>
                              <p className="text-white/90 font-serif leading-relaxed">
                                {msg.upaya}
                              </p>
                            </div>
                          )}

                          {/* Topic Tags */}
                          {msg.tags && msg.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {msg.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-gold/15 text-lightgold/80"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Mandatory Demo Indicator Banner */}
                          <div className="rounded-lg bg-black/40 border border-gold/15 px-3 py-1.5 text-[11px] text-mutedtext flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3 text-gold/80 flex-shrink-0" />
                              <span>Demo response – not generated by a live AI model.</span>
                            </span>
                            <span className="text-[10px] font-mono text-lightgold/60 hidden sm:inline">
                              Simulated Jyotish Logic
                            </span>
                          </div>

                          {/* Action Bar (Copy / Regenerate) */}
                          <div className="flex items-center justify-between pt-2 border-t border-gold/10 text-xs">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 text-mutedtext hover:text-white transition-colors text-[11px]"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">Copied to Clipboard!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 text-lightgold" />
                                  <span>Copy Response</span>
                                </>
                              )}
                            </button>

                            {isLatestAssistant && (
                              <button
                                type="button"
                                onClick={handleRegenerateResponse}
                                disabled={isThinking}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gold/10 text-lightgold hover:text-gold transition-colors text-[11px] disabled:opacity-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Regenerate Demo Response</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* TYPING / THINKING INDICATOR */}
              {isThinking && (
                <div className="flex flex-col items-start animate-fadeIn">
                  <div className="rounded-2xl rounded-tl-sm bg-[#0a071a]/95 border border-gold/30 p-4 text-white shadow-xl shadow-purple/20 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                        <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      </div>
                      <span className="font-display text-xs font-semibold text-lightgold">
                        Veda AI is consulting classical Parashara and Jaimini texts...
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-9 py-1">
                      <div className="h-2 w-2 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 rounded-full bg-lightgold animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 rounded-full bg-gold/80 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer (Bottom Area) */}
            <div className="p-3 sm:p-4 border-t border-gold/15 bg-[#070514]/95 flex-shrink-0 space-y-2">
              <div className="relative rounded-2xl border border-gold/30 bg-black/50 focus-within:border-gold/60 focus-within:shadow-md focus-within:shadow-purple/20 transition-all p-2">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Veda AI about your Kundli, 10th house career, Dasha period, or relationships..."
                  rows={2}
                  disabled={isThinking}
                  className="w-full bg-transparent text-white placeholder-mutedtext/70 text-xs sm:text-sm font-serif resize-none focus:outline-none pr-12 pl-2 pt-1 min-h-[46px] max-h-[120px]"
                />

                <div className="flex items-center justify-between pt-1 border-t border-gold/10 px-2 mt-1">
                  <span
                    className={`text-[10px] font-mono ${
                      inputMessage.length > MAX_CHAR_LIMIT * 0.9
                        ? 'text-red-400 font-semibold'
                        : 'text-mutedtext/70'
                    }`}
                  >
                    {inputMessage.length} / {MAX_CHAR_LIMIT} chars &bull; Enter to send, Shift+Enter for new line
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isThinking || inputMessage.length > MAX_CHAR_LIMIT}
                    className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-r from-gold to-lightgold text-black hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-gold/20 flex-shrink-0"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Ethical Disclaimer */}
              <p className="text-center text-[10px] text-mutedtext/70 font-serif">
                Veda AI provides educational Vedic astrology guidance. Interpretations are not guarantees of future events.
              </p>
            </div>
          </section>

          {/* ======================================================= */}
          {/* AREA C: CONTEXT PANEL (DESKTOP COLLAPSIBLE)             */}
          {/* ======================================================= */}
          {isContextPanelOpen && (
            <aside className="hidden xl:flex w-80 2xl:w-88 flex-shrink-0 flex-col border-l border-gold/15 bg-[#060411]/95 overflow-y-auto p-4 space-y-4 animate-fadeIn">
              {/* Context Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gold/15">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-gold" />
                  <h3 className="font-display text-xs font-bold text-white tracking-wider uppercase">
                    Astrological Context
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/10 text-lightgold border border-gold/20">
                  Demo Profile
                </span>
              </div>

              {/* Birth Profile Summary */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{user?.displayName || user?.name || 'Aarav Sharma'}</span>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                    className="text-[10px] text-lightgold hover:text-gold flex items-center gap-1"
                  >
                    <span>Edit Profile</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>

                <div className="space-y-1 text-[11px] font-serif text-mutedtext">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gold/80 flex-shrink-0" />
                    <span>DOB: {user?.dateOfBirth || '14 October 1994'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-gold/80 flex-shrink-0" />
                    <span>Time: {user?.birthTime || '06:45 AM (IST)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gold/80 flex-shrink-0" />
                    <span className="truncate">Location: {user?.birthLocation || 'Varanasi, Uttar Pradesh, India'}</span>
                  </div>
                </div>
              </div>

              {/* Core Astrological Pillars */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2">
                <span className="text-[11px] font-mono text-lightgold uppercase tracking-wider block">
                  Core Triad Placements
                </span>

                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-black/40 border border-gold/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-mutedtext block">Ascendant (Lagna)</span>
                      <span className="text-xs font-semibold text-white">{ASCENDANT_DATA.sign}</span>
                    </div>
                    <span className="text-[10px] font-mono text-lightgold/80">{ASCENDANT_DATA.degree}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-gold/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-mutedtext block">Moon Sign (Rashi)</span>
                      <span className="text-xs font-semibold text-white">{user?.moonSign || 'Capricorn (Makara)'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-lightgold/80">{user?.moonNakshatra || 'Shravana P-2'}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/40 border border-gold/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-mutedtext block">Sun Placement</span>
                      <span className="text-xs font-semibold text-white">Virgo (12th House)</span>
                    </div>
                    <span className="text-[10px] font-mono text-lightgold/80">27° 10&apos;</span>
                  </div>
                </div>
              </div>

              {/* Active Dasha Cycle */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-lightgold uppercase tracking-wider">
                    Vimshottari Dasha
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.CLIENT_PREDICTIONS)}
                    className="text-[10px] text-lightgold/80 hover:text-gold"
                  >
                    View All
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-gold/15 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-mutedtext">Mahadasha</span>
                    <span className="font-semibold text-white">
                      {VIMSHOTTARI_DASHA_DATA.activeMahadasha.planet} ({VIMSHOTTARI_DASHA_DATA.activeMahadasha.totalYears}y)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-mutedtext">Antardasha</span>
                    <span className="font-semibold text-lightgold">
                      {VIMSHOTTARI_DASHA_DATA.activeAntardasha.planet}
                    </span>
                  </div>
                  <div className="text-[10px] text-mutedtext/70 pt-1 border-t border-gold/10">
                    Active through: {VIMSHOTTARI_DASHA_DATA.activeAntardasha.endDate}
                  </div>
                </div>
              </div>

              {/* Live Transits (Gochara) Summary */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2">
                <span className="text-[11px] font-mono text-lightgold uppercase tracking-wider block">
                  Current Transits (Gochara)
                </span>

                <div className="space-y-1.5 text-xs">
                  {GOCHARA_TRANSITS_DATA.slice(0, 3).map((tr) => (
                    <div
                      key={tr.id}
                      className="p-2 rounded-lg bg-black/40 border border-gold/10 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-white">{tr.planet}</span>
                        <span className="text-[10px] text-mutedtext block">{tr.natalHouse}</span>
                      </div>
                      <span className="text-[10px] font-mono text-lightgold/80">{tr.currentSign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Educational Note */}
              <div className="p-3 rounded-xl bg-gold/5 border border-gold/15 text-[11px] text-mutedtext font-serif leading-relaxed">
                Placements are synchronized with your saved birth details and Lahiri Ayanamsha (Chitra Paksha).
              </div>
            </aside>
          )}
        </div>

        {/* ========================================================= */}
        {/* MOBILE SIDEBAR DRAWER OVERLAY                              */}
        {/* ========================================================= */}
        {isSidebarOpenMobile && (
          <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsSidebarOpenMobile(false)}
            />

            {/* Slide-over Drawer */}
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#070514] border-r border-gold/25 shadow-2xl flex flex-col z-10 animate-slideRight">
              <div className="p-4 border-b border-gold/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gold" />
                  <span className="font-display text-sm font-semibold text-white">Consultations</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpenMobile(false)}
                  className="p-1 rounded-lg text-mutedtext hover:text-white hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile New Chat CTA */}
              <div className="p-3 border-b border-gold/15">
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gold/20 border border-gold/40 text-lightgold text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Consultation</span>
                </button>
              </div>

              {/* Mobile Conversations List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setIsSidebarOpenMobile(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-gold/40 bg-gold/15 text-white'
                          : 'border-transparent text-mutedtext hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs font-medium truncate block">{conv.title}</span>
                        <span className="text-[10px] text-mutedtext/70">{formatDate(conv.updatedAt)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(conv);
                        }}
                        className="p-1 text-mutedtext hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MOBILE CONTEXT PANEL DRAWER                               */}
        {/* ========================================================= */}
        {isContextDrawerMobile && (
          <div className="fixed inset-0 z-50 xl:hidden animate-fadeIn">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsContextDrawerMobile(false)}
            />

            {/* Slide-over Drawer */}
            <div className="fixed inset-y-0 right-0 w-88 max-w-[90vw] bg-[#070514] border-l border-gold/25 shadow-2xl flex flex-col z-10 animate-slideLeft p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gold/15">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-gold" />
                  <span className="font-display text-sm font-semibold text-white">Astrological Context</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContextDrawerMobile(false)}
                  className="p-1 rounded-lg text-mutedtext hover:text-white hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Birth Profile Summary */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2 text-xs">
                <div className="font-semibold text-white">{user?.displayName || user?.name || 'Aarav Sharma'}</div>
                <div className="text-mutedtext space-y-1 text-[11px]">
                  <div>DOB: {user?.dateOfBirth || '14 October 1994'} ({user?.birthTime || '06:45 AM (IST)'})</div>
                  <div>Location: {user?.birthLocation || 'Varanasi, Uttar Pradesh, India'}</div>
                  <div>Ayanamsha: {user?.ayanamsa || 'Lahiri (24°09\')'}</div>
                </div>
              </div>

              {/* Core Placements */}
              <div className="rounded-xl border border-gold/20 bg-white/5 p-3 space-y-2 text-xs">
                <div className="font-mono text-lightgold uppercase text-[10px]">Key Coordinates</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-mutedtext">Ascendant:</span>
                    <span className="text-white font-medium">{ASCENDANT_DATA.sign} ({ASCENDANT_DATA.degree})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mutedtext">Moon Sign:</span>
                    <span className="text-white font-medium">{user?.moonSign || 'Capricorn (Makara)'} ({user?.moonNakshatra || 'Shravana'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mutedtext">Active Dasha:</span>
                    <span className="text-lightgold font-medium">Jupiter / Saturn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONVERSATION CONFIRMATION MODAL                     */}
        {/* ========================================================= */}
        {conversationToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-[#0c081e] p-6 space-y-4 shadow-2xl shadow-red-500/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-white">Delete Consultation?</h4>
                  <p className="text-xs text-mutedtext">This will remove this consultation from your browser session.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-gold/15 text-xs text-white/90 font-serif">
                &ldquo;{conversationToDelete.title}&rdquo;
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConversationToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-gold/20 bg-white/5 text-xs font-semibold text-mutedtext hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteConversation}
                  className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ChatPage;
