import React, { useState, useRef } from 'react';
import { FileSearch, BookOpen, HelpCircle, ListChecks, MessageSquare, UploadCloud, AlertCircle, Sparkles, Check, BookmarkPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { queryPdfAssistant } from '../../services/api';
import { LatexRenderer } from '../common/LatexRenderer';

export const PDFAssistantScreen: React.FC = () => {
  const { user, language, saveItem, incrementAiUsage } = useApp();

  const [documentText, setDocumentText] = useState<string>('');
  const [docTitle, setDocTitle] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'summary' | 'qa' | 'revision_notes' | 'practice_questions'>('summary');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset academic textbook chapters for 1-click test
  const sampleDocs = [
    {
      title: 'Digital Electronics - Logic Gates & Karnaugh Maps',
      text: `CHAPTER 4: COMBINATIONAL LOGIC MINIMIZATION

Section 4.1: Boolean Axioms and Theorems
Boolean algebra is defined over set B = {0, 1} with operators AND (conjunction), OR (disjunction), and NOT (complement). Fundamental laws: Commutative, Associative, Distributive, Identity, and De Morgan's Laws: (A + B)' = A'B' and (AB)' = A' + B'.

Section 4.2: Karnaugh Maps (K-Maps)
A Karnaugh map provides a systematic pictorial method to simplify Boolean expressions without applying algebraic theorems. K-maps use Gray code ordering (00, 01, 11, 10) so that adjacent cells differ by exactly one binary variable.
- 2-variable map: 4 cells
- 3-variable map: 8 cells
- 4-variable map: 16 cells

Section 4.3: Prime Implicants and Essential Prime Implicants
An implicant is a product term that covers one or more minterms. A prime implicant is a grouping of 2^k adjacent 1s that cannot be combined into a larger group. An essential prime implicant contains at least one minterm not covered by any other prime implicant. Minimization rule: Always include all essential prime implicants first.

Section 4.4: Don't Care Conditions
In incompletely specified functions, outputs for certain input combinations are never produced or irrelevant. These are marked as 'X' and can be grouped as 1s if they help enlarge a group, or as 0s if they do not.`,
    },
    {
      title: 'Thermodynamics - Heat Engines & Second Law',
      text: `CHAPTER 6: SECOND LAW OF THERMODYNAMICS

Section 6.1: Limitations of the First Law
The First Law of Thermodynamics guarantees the conservation of energy during a process. However, it cannot predict whether a spontaneous process is physically possible or its direction. For example, heat naturally flows from a high-temperature body to a low-temperature body, but the reverse requires external work.

Section 6.2: Thermal Energy Reservoirs & Heat Engines
A thermal reservoir possesses large thermal capacity such that its temperature remains unchanged during heat transfer. A heat engine operates in a thermodynamic cycle, receives heat Q_H from a high-temp reservoir at T_H, converts a fraction into network W_net, and discharges waste heat Q_L to a low-temp sink at T_L.
Thermal Efficiency: eta_th = W_net / Q_H = 1 - (Q_L / Q_H).

Section 6.3: Kelvin-Planck and Clausius Statements
- Kelvin-Planck Statement: It is impossible for any device operating on a cycle to receive heat from a single reservoir and produce an equivalent amount of work. (Perpetual motion machine of second kind is impossible).
- Clausius Statement: It is impossible to construct a device operating in a cycle that produces no effect other than the transfer of heat from a cooler body to a hotter body without external work input.

Section 6.4: Carnot Heat Engine
The Carnot cycle is an ideal reversible cycle comprising two isothermal and two adiabatic processes. Carnot efficiency: eta_Carnot = 1 - (T_L / T_H) with temperatures in Kelvin. No real engine can exceed this theoretical ceiling.`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setDocTitle(file.name);
      setDocumentText(text.length > 50 ? text : sampleDocs[0].text);
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sample: (typeof sampleDocs)[0]) => {
    setDocTitle(sample.title);
    setDocumentText(sample.text);
    setResult(null);
    setErrorMsg(null);
  };

  const executeAction = async (actionType: typeof activeAction) => {
    if (!documentText.trim()) {
      setErrorMsg('Please upload a document or choose a sample chapter.');
      return;
    }

    if (actionType === 'qa' && !userQuestion.trim()) {
      setErrorMsg('Please type your question about the document.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setActiveAction(actionType);

    try {
      const res = await queryPdfAssistant({
        documentText,
        action: actionType,
        userQuestion: actionType === 'qa' ? userQuestion : undefined,
        language: user?.preferredLanguage || language,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setResult(res.result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process document');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (!result) return;
    saveItem({
      title: `${docTitle || 'PDF Assistant'}: ${activeAction.toUpperCase()}`,
      content: result,
      type: 'pdf_summary',
      subject: docTitle || 'PDF Document Analysis',
      module: activeAction,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-rose-500" />
          PDF Study Assistant
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload any textbook or chapter PDF (up to 10 MB, 100 pages) for strict document-grounded analysis.
        </p>
      </div>

      {/* Document Upload or Preset Selection */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">Active Document</span>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF / TXT</span>
          </button>
        </div>

        {/* Quick sample chapters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] text-slate-400 shrink-0">Sample Chapters:</span>
          {sampleDocs.map((s, i) => (
            <button
              key={i}
              onClick={() => handleLoadSample(s)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>

        {docTitle ? (
          <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-900 dark:text-rose-200 truncate">{docTitle}</span>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
              {(documentText.length / 1024).toFixed(1)} KB cached
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
            No document loaded. Pick a sample chapter above or upload your textbook PDF.
          </div>
        )}
      </div>

      {/* Feature Mode Action Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'summary' as const, label: 'Chapter Summary', icon: BookOpen },
          { id: 'qa' as const, label: 'Document Q&A', icon: MessageSquare },
          { id: 'revision_notes' as const, label: 'Revision Notes', icon: ListChecks },
          { id: 'practice_questions' as const, label: '5-10 Questions', icon: HelpCircle },
        ].map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => {
                setActiveAction(act.id);
                if (act.id !== 'qa') {
                  executeAction(act.id);
                }
              }}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                activeAction === act.id
                  ? 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
              }`}
            >
              <Icon className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] leading-tight">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Q&A Input Box when in Document Q&A mode */}
      {activeAction === 'qa' && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white">
            Ask Any Question About This Document
          </label>
          <p className="text-[10px] text-slate-400">
            *Answers are strictly grounded in the uploaded document. If not present, the assistant will inform you immediately.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="e.g. What is the efficiency of a Carnot heat engine?"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              onClick={() => executeAction('qa')}
              disabled={loading || !userQuestion.trim()}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-semibold text-rose-500">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Analyzing document with strict fidelity...</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {activeAction.replace('_', ' ').toUpperCase()} RESULT
            </span>

            <button
              onClick={handleSaveResult}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium hover:bg-rose-100 transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Content</span>
                </>
              )}
            </button>
          </div>

          <LatexRenderer content={result} />
        </div>
      )}
    </div>
  );
};
