import React from 'react';
import {
  Camera,
  FileText,
  Award,
  HelpCircle,
  FileSearch,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PhotoSolverScreen } from '../photo/PhotoSolverScreen';
import { NotesGeneratorScreen } from '../notes/NotesGeneratorScreen';
import { ExamAnswerScreen } from '../exam/ExamAnswerScreen';
import { QuizGeneratorScreen } from '../quiz/QuizGeneratorScreen';
import { PDFAssistantScreen } from '../pdf/PDFAssistantScreen';
import { StudyPlannerScreen } from '../planner/StudyPlannerScreen';
import { ChatbotScreen } from '../chat/ChatbotScreen';

export const ToolsScreen: React.FC = () => {
  const { activeTool, setActiveTool } = useApp();

  if (activeTool === 'photo') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <PhotoSolverScreen />
      </div>
    );
  }

  if (activeTool === 'notes') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <NotesGeneratorScreen />
      </div>
    );
  }

  if (activeTool === 'exam') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <ExamAnswerScreen />
      </div>
    );
  }

  if (activeTool === 'quiz') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <QuizGeneratorScreen />
      </div>
    );
  }

  if (activeTool === 'pdf') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <PDFAssistantScreen />
      </div>
    );
  }

  if (activeTool === 'planner') {
    return (
      <div className="relative">
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTool(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Back to Tools Hub</span>
        </div>
        <StudyPlannerScreen />
      </div>
    );
  }

  const allTools = [
    {
      id: 'photo' as const,
      title: 'Photo Question Solver',
      badge: 'Vision OCR',
      desc: 'Snap or upload any handwritten math/science problem for step-by-step LaTeX derivations.',
      icon: Camera,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'notes' as const,
      title: 'AI Notes Generator',
      badge: 'PDF Export',
      desc: 'Synthesize syllabus topics into Short (~150w), Medium (~400w), or Detailed (~900w) notes and download PDF.',
      icon: FileText,
      color: 'from-sky-500 to-blue-600',
    },
    {
      id: 'exam' as const,
      title: 'Exam Answer Generator',
      badge: 'University Schemas',
      desc: 'Formulate model answers calibrated to 2-mark, 5-mark, or 10-mark university grading criteria.',
      icon: Award,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'quiz' as const,
      title: 'AI Quiz Generator',
      badge: 'Self-Assessment',
      desc: 'Formulate 5, 10, or 20 objective questions with instant grading, explanations, and retry variation.',
      icon: HelpCircle,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'pdf' as const,
      title: 'PDF Study Assistant',
      badge: 'Strict Grounding',
      desc: 'Chapter summary, grounded document Q&A, rapid revision notes, and 5-10 practice questions.',
      icon: FileSearch,
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 'planner' as const,
      title: 'Smart Study Planner',
      badge: 'Exam Countdown',
      desc: 'Automated daily study timelines weighted by exam date proximity and subject priority levels.',
      icon: Calendar,
      color: 'from-indigo-500 to-purple-600',
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          AI Academic Suite
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select any specialized academic tool below to accelerate your learning and exam performance.
        </p>
      </div>

      <div className="space-y-3">
        {allTools.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500 hover:shadow-md cursor-pointer transition-all group flex items-start gap-3.5"
            >
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${t.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform mt-0.5`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {t.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 mt-3" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
