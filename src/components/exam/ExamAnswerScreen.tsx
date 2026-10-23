import React, { useState } from 'react';
import { Award, Copy, Check, BookmarkPlus, Sparkles, AlertCircle, BookCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateExamAnswer } from '../../services/api';
import { LatexRenderer } from '../common/LatexRenderer';
import { MarkType } from '../../types';

export const ExamAnswerScreen: React.FC = () => {
  const { user, language, saveItem, incrementAiUsage } = useApp();

  const [question, setQuestion] = useState('Explain the Von Neumann Architecture with its functional units and bottleneck');
  const [markType, setMarkType] = useState<MarkType>('5-mark');
  const [subject, setSubject] = useState('Computer Architecture');
  const [answer, setAnswer] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>('AI-generated. Verify against your textbook before use.');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleQuestions = [
    {
      q: 'State and prove De Morgan laws in Boolean algebra',
      mark: '2-mark' as MarkType,
      subj: 'Digital Electronics',
    },
    {
      q: 'Explain the Von Neumann Architecture with functional units and bottleneck',
      mark: '5-mark' as MarkType,
      subj: 'Computer Architecture',
    },
    {
      q: 'Explain OSI 7-Layer Reference Model with functions and protocols of each layer',
      mark: '10-mark' as MarkType,
      subj: 'Computer Networks',
    },
  ];

  const handleGenerate = async () => {
    if (!question.trim()) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await generateExamAnswer({
        question,
        markType,
        subject,
        language: user?.preferredLanguage || language,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setAnswer(res.answer);
        setDisclaimer(res.disclaimer || 'AI-generated. Verify against your textbook before use.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate exam answer');
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (!answer) return;
    navigator.clipboard.writeText(`${answer}\n\n${disclaimer}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!answer) return;
    saveItem({
      title: `${markType} Answer: ${question.slice(0, 45)}...`,
      content: `${answer}\n\n${disclaimer}`,
      type: 'exam_answer',
      subject,
      module: 'University Exam Answers',
      markType,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Exam Answer Generator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Format academic answers strictly according to university marking schemes (2-mark, 5-mark, and 10-mark formats).
        </p>
      </div>

      {/* Mark Type Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Select Question Mark Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: '2-mark' as MarkType, title: '2-Mark', desc: 'Definition + 2-3 points (~60 words)' },
            { type: '5-mark' as MarkType, title: '5-Mark', desc: 'Definition + 4-5 pts + example + conclusion (~200 words)' },
            { type: '10-mark' as MarkType, title: '10-Mark', desc: 'Detailed + diagram description + conclusion (~500 words)' },
          ].map((m) => (
            <button
              key={m.type}
              onClick={() => setMarkType(m.type)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                markType === m.type
                  ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
              }`}
            >
              <div className="text-xs font-bold">{m.title}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Computer Architecture"
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Question Input */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
        <label className="block text-xs font-bold text-slate-900 dark:text-white">Exam Question</label>

        {/* Quick sample buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] text-slate-400 shrink-0">Sample Questions:</span>
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(sq.q);
                setMarkType(sq.mark);
                setSubject(sq.subj);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
            >
              {sq.mark}: {sq.subj}
            </button>
          ))}
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Enter university question..."
          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !question.trim()}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? `Drafting ${markType} Answer...` : `Generate ${markType} Exam Answer`}</span>
        </button>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Answer Output */}
      {answer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {markType} Model Answer
              </span>
              <p className="text-[10px] text-slate-400 truncate max-w-xs">{question}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAnswer}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-600 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors shadow-xs"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <LatexRenderer content={answer} />

          {/* Mandatory AI Accuracy Textbook Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2 mt-4">
            <BookCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">{disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
