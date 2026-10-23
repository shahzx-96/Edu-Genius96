import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  HelpCircle,
  Check,
  BookmarkPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askChatbot } from '../../services/api';
import { LatexRenderer } from '../common/LatexRenderer';
import { ChatMessage } from '../../types';

export const ChatbotScreen: React.FC = () => {
  const {
    user,
    conversations,
    activeConversationId,
    setActiveConversationId,
    addMessageToActive,
    createNewConversation,
    deleteConversation,
    language,
    saveItem,
    incrementAiUsage,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Engineering Mathematics');
  const [loading, setLoading] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const subjects = [
    'Engineering Mathematics',
    'Computer Science & Coding',
    'Electronics & Circuits',
    'Physics & Mechanics',
    'GATE / Competitive Exams',
    'General Science',
  ];

  // Auto-scroll on message addition
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, loading]);

  const handleSend = async (overrideMessage?: string, rewriteMode?: 'simpler' | 'detailed') => {
    const query = overrideMessage || inputText.trim();
    if (!query) return;

    setErrorMessage(null);

    // If active conversation doesn't exist, create one
    if (!activeConversationId) {
      createNewConversation(selectedSubject, query);
    }

    if (!rewriteMode) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: new Date().toISOString(),
        subject: selectedSubject,
      };
      addMessageToActive(userMsg);
      setInputText('');
    }

    setLoading(true);

    try {
      const res = await askChatbot({
        message: query,
        language: user?.preferredLanguage || language,
        mode: rewriteMode || 'normal',
        subject: selectedSubject,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.response,
          timestamp: new Date().toISOString(),
          mode: rewriteMode || 'normal',
          language: user?.preferredLanguage || language,
          subject: selectedSubject,
        };
        addMessageToActive(assistantMsg);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network failure. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = (lastUserMsg: string, mode: 'simpler' | 'detailed') => {
    handleSend(lastUserMsg, mode);
  };

  const handleSaveToContent = (msg: ChatMessage) => {
    saveItem({
      title: `${activeConv?.title || 'Chat'}: ${msg.content.slice(0, 40)}...`,
      content: msg.content,
      type: 'chat',
      subject: selectedSubject,
      module: 'AI Chat Explanations',
    });
    setSavedMessageId(msg.id);
    setTimeout(() => setSavedMessageId(null), 2500);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] md:h-[680px] bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Top Chat Header */}
      <div className="p-3 bg-white dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
            title="Chat History"
          >
            <Clock className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {activeConv?.title || 'New Study Session'}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="truncate">{selectedSubject}</span>
              <span>·</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {user?.preferredLanguage || language}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => createNewConversation(selectedSubject)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* History Slide-over Drawer */}
      {showHistoryDrawer && (
        <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-left duration-200">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chat History
            </span>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No past chats</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    c.id === activeConversationId
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setShowHistoryDrawer(false);
                  }}
                >
                  <div className="truncate flex-1 pr-2">
                    <p className="truncate">{c.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Subject Horizontal Selector */}
      <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
              selectedSubject === sub
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!activeConv || activeConv.messages.length === 0) && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              What would you like to master today?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ask any engineering derivation, coding algorithm, math proof, or exam concept in your preferred language.
            </p>

            <div className="w-full space-y-1.5 text-left">
              {[
                'Derive Fourier series coefficients for a square wave',
                'Explain Dijkstra vs Bellman-Ford algorithm with complexity',
                'What is the physical meaning of Maxwell Ampere law?',
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(starter)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left truncate"
                >
                  💡 {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeConv?.messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          // Find preceding user question for rewrite buttons
          let precedingUserQuery = '';
          if (!isUser) {
            for (let i = index - 1; i >= 0; i--) {
              if (activeConv.messages[i].role === 'user') {
                precedingUserQuery = activeConv.messages[i].content;
                break;
              }
            }
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%] ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl shadow-xs transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    {msg.mode && msg.mode !== 'normal' && (
                      <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                        {msg.mode === 'simpler' ? '✦ Simplified Explanation' : '✦ Detailed Technical Breakdown'}
                      </div>
                    )}
                    <LatexRenderer content={msg.content} />

                    {/* Simpler / More Detailed & Save actions on AI answer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRewrite(precedingUserQuery || msg.content, 'simpler')}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] font-medium transition-colors"
                        >
                          Simpler
                        </button>
                        <button
                          onClick={() => handleRewrite(precedingUserQuery || msg.content, 'detailed')}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] font-medium transition-colors"
                        >
                          More detailed
                        </button>
                      </div>

                      <button
                        onClick={() => handleSaveToContent(msg)}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-0.5 px-1.5 rounded"
                      >
                        {savedMessageId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Saved</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>Save to Notes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 px-1 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 w-fit text-slate-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">EduGenius is calculating & formulating...</span>
          </div>
        )}

        {/* Error banner with retry */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSend(inputText)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-medium text-[11px] hover:bg-rose-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-white dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            maxLength={2000}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder={`Ask ${selectedSubject} question (${user?.preferredLanguage || language})...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
