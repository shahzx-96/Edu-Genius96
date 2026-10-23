import React, { useState } from 'react';
import {
  MessageSquare,
  Camera,
  FileText,
  HelpCircle,
  Award,
  FileSearch,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  BookOpen,
  ChevronRight,
  TrendingUp,
  WifiOff,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoModeBanner } from '../common/DemoModeBanner';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    setActiveTab,
    setActiveTool,
    createNewConversation,
    conversations,
    savedItems,
    subjects,
    tasks,
    toggleTaskCompletion,
    language,
    isOnline,
    cachedMaterials,
  } = useApp();

  const [quickInput, setQuickInput] = useState('');

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Student';

  // Handle quick question send
  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const text = quickInput.trim();
    createNewConversation('Quick Question', text);
    setQuickInput('');
    setActiveTab('chat');
  };

  // Recent 3 chats
  const recentChats = conversations.slice(0, 3);

  // Saved 3 notes
  const recentNotes = savedItems.filter((i) => i.type === 'notes').slice(0, 3);

  // Upcoming 3 exams sorted by date
  const upcomingExams = [...subjects]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3);

  // Today's tasks
  const todayTasks = tasks.slice(0, 3);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Days left calculation
  const getDaysLeft = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const quickTools = [
    {
      id: 'chat',
      title: 'AI Chatbot',
      desc: 'Ask any academic question',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
      action: () => setActiveTab('chat'),
    },
    {
      id: 'photo',
      title: 'Photo Solver',
      desc: 'OCR & step-by-step math',
      icon: Camera,
      color: 'from-purple-500 to-violet-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('photo');
      },
    },
    {
      id: 'notes',
      title: 'Notes Generator',
      desc: 'Short, Medium & Detailed',
      icon: FileText,
      color: 'from-sky-500 to-blue-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('notes');
      },
    },
    {
      id: 'exam',
      title: 'Exam Answers',
      desc: '2, 5 & 10 mark formats',
      icon: Award,
      color: 'from-amber-500 to-orange-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('exam');
      },
    },
    {
      id: 'quiz',
      title: 'Quiz Generator',
      desc: '5, 10 or 20 questions',
      icon: HelpCircle,
      color: 'from-emerald-500 to-teal-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('quiz');
      },
    },
    {
      id: 'pdf',
      title: 'PDF Assistant',
      desc: 'Chapter summary & Q&A',
      icon: FileSearch,
      color: 'from-rose-500 to-pink-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('pdf');
      },
    },
    {
      id: 'planner',
      title: 'Study Planner',
      desc: 'Personalized schedule',
      icon: Calendar,
      color: 'from-indigo-500 to-purple-600',
      action: () => {
        setActiveTab('tools');
        setActiveTool('planner');
      },
    },
  ];

  return (
    <div className="pb-20 space-y-5 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="pt-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
              EduGenius AI
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.course ? `${user.course} · ${user.semester}` : 'Your AI Teacher in Your Pocket'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-bold text-sm">
            {firstName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      <DemoModeBanner />

      {/* Offline Mode Alert Banner (IndexedDB Caching Active) */}
      {!isOnline && (
        <div className="px-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs tracking-tight text-amber-900 dark:text-amber-100">
                  Offline Study Mode Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 font-bold text-amber-800 dark:text-amber-300 shrink-0 flex items-center gap-1">
                  <Database className="w-3 h-3" /> IndexedDB
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
                You are currently offline. All your {cachedMaterials.length} cached study notes, exam answers, and summaries are available without an internet connection.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
              >
                Browse {cachedMaterials.length} Cached Materials in Saved →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick "Ask AI" Input Bar */}
      <div className="px-4">
        <form
          onSubmit={handleQuickAsk}
          className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/80 p-1.5 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500 transition-all"
        >
          <div className="p-2.5 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask any question (e.g. Derive Laplace Transform)..."
            className="flex-1 bg-transparent border-none text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-sm active:scale-95 transition-all"
            aria-label="Send question"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Progress & Study Goals Strip */}
      <div className="px-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg shadow-indigo-950/20 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Overall Study Progress</span>
            </div>
            <span className="font-mono text-sm font-extrabold text-emerald-400">{progressPercent}% Completed</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Today's Goals preview */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-300">Today's Focus Tasks</span>
              <button
                onClick={() => {
                  setActiveTab('tools');
                  setActiveTool('planner');
                }}
                className="text-[11px] text-purple-300 hover:text-purple-200 font-semibold"
              >
                View Plan →
              </button>
            </div>
            <div className="space-y-1.5">
              {todayTasks.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No tasks scheduled for today. Add one in Planner!</p>
              ) : (
                todayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTaskCompletion(t.id)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs"
                  >
                    {t.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={`truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {t.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tools Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Study Tools</h2>
          <button
            onClick={() => setActiveTab('tools')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            All 7 Tools →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all text-left group active:scale-[0.98]"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{tool.title}</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{tool.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Examinations */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Upcoming Exams
            </h2>
          </div>
          <button
            onClick={() => {
              setActiveTab('tools');
              setActiveTool('planner');
            }}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Manage →
          </button>
        </div>

        <div className="space-y-2">
          {upcomingExams.map((subj) => {
            const days = getDaysLeft(subj.examDate);
            return (
              <div
                key={subj.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{subj.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Exam Date: {subj.examDate} · Priority: {subj.priority}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs">
                    {days} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Chats (Last 3) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Chats</h2>
          </div>
          <button onClick={() => setActiveTab('chat')} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
            View All ({conversations.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {recentChats.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setActiveTab('chat');
              }}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex-1 pr-3">
                <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{c.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{c.subject}</span>
                  <span>·</span>
                  <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Saved Notes (Last 3) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Saved Notes</h2>
          </div>
          <button onClick={() => setActiveTab('saved')} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
            Saved Content ({savedItems.length}) →
          </button>
        </div>

        <div className="space-y-2">
          {recentNotes.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
              No saved notes yet. Generate notes from any PDF or topic and save them here!
            </div>
          ) : (
            recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveTab('saved')}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex-1 pr-3">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{note.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {note.subject} {note.module ? `· ${note.module}` : ''}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                  Notes
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
