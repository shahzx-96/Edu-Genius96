import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Check, BookmarkPlus, RefreshCw, AlertCircle, Edit2, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { solvePhotoQuestion } from '../../services/api';
import { LatexRenderer } from '../common/LatexRenderer';

export const PhotoSolverScreen: React.FC = () => {
  const { user, language, saveItem, incrementAiUsage } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedQuestion, setExtractedQuestion] = useState<string>('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample photo problems for instant testing
  const sampleProblems = [
    {
      title: 'Differential Equation',
      desc: 'y" + 4y\' + 4y = 0 with initial conditions',
      preview: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
      question: 'Solve the differential equation: d²y/dx² + 4 dy/dx + 4y = 0 with initial conditions y(0) = 1, y\'(0) = 0.',
    },
    {
      title: 'RLC Circuit Transient',
      desc: 'Series RLC resonant frequency and damping factor',
      preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
      question: 'In a series RLC circuit, R = 20 Ω, L = 0.1 H, and C = 100 μF. Determine the natural frequency ω_0 and the damping factor α.',
    },
    {
      title: 'Calculus Double Integral',
      desc: '∬_R (x² + y²) dA over unit circle',
      preview: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
      question: 'Evaluate the double integral ∬_R (x² + y²) dA where R is the disk x² + y² ≤ 1 using polar coordinates.',
    },
  ];

  // Helper to compress image client-side to < 5MB / optimal dimension
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorMsg('Accepted formats: JPEG and PNG only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image exceeds 5 MB. Compressing image...');
    }

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setErrorMsg(null);
      setSolution(null);
      // Pre-populate question so user can edit if they want
      setExtractedQuestion('Analyzing image with OCR...');
      setIsEditingQuestion(false);
      // Auto run OCR & solve
      executeSolve(compressed, undefined);
    } catch (err) {
      setErrorMsg('Failed to process image.');
    }
  };

  const handleSelectSample = (sample: (typeof sampleProblems)[0]) => {
    setImagePreview(sample.preview);
    setExtractedQuestion(sample.question);
    setErrorMsg(null);
    setSolution(null);
    setIsEditingQuestion(false);
    executeSolve(undefined, sample.question);
  };

  const executeSolve = async (imgBase64?: string, textQuestion?: string) => {
    const img = imgBase64 || imagePreview || undefined;
    const q = textQuestion || (extractedQuestion !== 'Analyzing image with OCR...' ? extractedQuestion : undefined);

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await solvePhotoQuestion({
        imageBase64: img,
        correctedQuestion: q,
        language: user?.preferredLanguage || language,
        userId: user?.id,
      });

      incrementAiUsage();

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setExtractedQuestion(res.extractedQuestion);
        setSolution(res.solution);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to solve photo problem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSolution = () => {
    if (!solution) return;
    saveItem({
      title: extractedQuestion ? extractedQuestion.slice(0, 50) + '...' : 'Photo Problem Solution',
      content: `**Question:**\n${extractedQuestion}\n\n**Solution:**\n${solution}`,
      type: 'photo_solution',
      subject: 'STEM Problem Solving',
      module: 'Step-by-Step Solutions',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-2xl mx-auto animate-in fade-in">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Photo Question Solver
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Capture or upload any textbook problem, handwritten equation, or diagram for step-by-step LaTeX derivation.
        </p>
      </div>

      {/* Upload & Camera Actions */}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-purple-300 dark:border-purple-800/60 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 flex flex-col items-center justify-center text-center transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Take Photo</span>
          <span className="text-[10px] text-slate-400">Camera / File</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 flex flex-col items-center justify-center text-center transition-all group active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Upload Image</span>
          <span className="text-[10px] text-slate-400">JPEG / PNG &lt; 5MB</span>
        </button>
      </div>

      {/* Preset Problem Cards for instant demonstration */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Or try sample exam questions:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleProblems.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSelectSample(p)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500 text-left transition-all"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.title}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Image Preview & Extracted Question Card */}
      {imagePreview && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Problem Image</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Compressed</span>
            </span>
            <button
              onClick={() => {
                setImagePreview(null);
                setSolution(null);
                setExtractedQuestion('');
              }}
              className="text-[11px] text-rose-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="max-h-48 overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
            <img
              src={imagePreview}
              alt="Problem"
              className="max-h-48 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Extracted Question with Edit capability */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Extracted Question Text (Verify / Correct)
              </span>
              <button
                onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                className="text-[11px] text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingQuestion ? 'Done Editing' : 'Edit'}</span>
              </button>
            </div>

            {isEditingQuestion ? (
              <textarea
                value={extractedQuestion}
                onChange={(e) => setExtractedQuestion(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            ) : (
              <p className="text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                {extractedQuestion || 'No question extracted yet.'}
              </p>
            )}

            <button
              onClick={() => executeSolve()}
              disabled={loading}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{loading ? 'Solving with Gemini Vision...' : 'Solve This Question'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Shimmer */}
      {loading && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>OCR reading text & deriving mathematical solution...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => executeSolve()}
            className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Solved Result Card */}
      {solution && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Verified Step-by-Step Derivation
            </span>

            <button
              onClick={handleSaveSolution}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-100 transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Saved to Content</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Solution</span>
                </>
              )}
            </button>
          </div>

          <LatexRenderer content={solution} />
        </div>
      )}
    </div>
  );
};
