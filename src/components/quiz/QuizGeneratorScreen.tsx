import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Award, History, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQuiz } from '../../services/api';
import { LatexRenderer } from '../common/LatexRenderer';
import { QuizQuestion } from '../../types';

export const QuizGeneratorScreen: React.FC = () => {
  const { user, language, quizHistory, saveQuizResult, incrementAiUsage } = useApp();

  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const sampleTopics = [
    { s: 'Computer Science', t: 'Data Structures & Trees' },
    { s: 'Thermodynamics', t: 'First & Second Laws' },
    { s: 'Signals & Systems', t: 'Fourier & Laplace Transforms' },
    { s: 'General Aptitude', t: 'Permutations & Probability' },
  ];

  const handleStartQuiz = async () => {
    if (!topic.trim()) return;

    setErrorMsg(null);
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const res = await generateQuiz({
        subject,
        topic,
        questionCount,
        language: user?.preferredLanguage || language,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        setErrorMsg('Failed to formulate quiz questions. Please retry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quiz generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    // Save to quiz history
    saveQuizResult({
      subject,
      topic,
      questionCount: questions.length,
      score,
      percentage,
      questions,
      userAnswers: Object.values(userAnswers),
    });
  };

  const currentQ = questions[currentQuestionIndex];
  const finalScore = submitted ? calculateScore() : 0;
  const percentage = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0;

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            AI Quiz Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate 5, 10, or 20 objective questions with instant grading and explanations.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors shadow-xs"
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({quizHistory.length})</span>
        </button>
      </div>

      {/* History Modal / Drawer */}
      {showHistory && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Past Quiz Attempts
            </span>
            <button onClick={() => setShowHistory(false)} className="text-xs text-slate-400 hover:text-slate-600">
              Close
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {quizHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No quiz records yet. Take your first quiz!</p>
            ) : (
              quizHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{item.topic}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.subject} · {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-xs ${
                        item.percentage >= 70 ? 'text-emerald-500' : item.percentage >= 40 ? 'text-amber-500' : 'text-rose-500'
                      }`}
                    >
                      {item.score}/{item.questionCount} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quiz Setup Form (when no quiz active or when creating new) */}
      {questions.length === 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick topic buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] text-slate-400 shrink-0">Sample Topics:</span>
            {sampleTopics.map((st, i) => (
              <button
                key={i}
                onClick={() => {
                  setSubject(st.s);
                  setTopic(st.t);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
              >
                {st.t}
              </button>
            ))}
          </div>

          {/* Question Count Selector: 5, 10, or 20 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    questionCount === cnt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={loading || !topic.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Quiz...' : `Generate ${questionCount}-Question Quiz`}</span>
          </button>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Quiz Card */}
      {questions.length > 0 && currentQ && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {subject} · {topic}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            {submitted && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  Score: {finalScore}/{questions.length} ({percentage}%)
                </span>
                <button
                  onClick={handleStartQuiz}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                  title="Retry will generate new questions"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            <LatexRenderer content={currentQ.question} />
          </div>

          {/* 4 Options */}
          <div className="space-y-2">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = userAnswers[currentQuestionIndex] === optIdx;
              const isCorrect = currentQ.correctIndex === optIdx;

              let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-white dark:bg-slate-900';
              if (isSelected && !submitted) {
                btnStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
              }
              if (submitted) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200';
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={submitted}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <div className="flex-1">
                    <LatexRenderer content={option} />
                  </div>
                  {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Explanation after submission */}
          {submitted && currentQ.explanation && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Explanation:</span>
              <LatexRenderer content={currentQ.explanation} />
            </div>
          )}

          {/* Navigation & Submit footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              Previous
            </button>

            <div className="flex gap-1 overflow-x-auto max-w-[140px] py-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold ${
                    currentQuestionIndex === i
                      ? 'bg-emerald-600 text-white'
                      : userAnswers[i] !== undefined
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Next
              </button>
            ) : !submitted ? (
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuestions([]);
                  setSubmitted(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                New Topic
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
