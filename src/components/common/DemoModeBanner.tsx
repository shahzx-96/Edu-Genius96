import React from 'react';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, aiModelName } = useApp();

  if (!isDemoMode) {
    return (
      <div className="mx-4 mt-3 mb-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">LIVE AI CONNECTED · {aiModelName}</span>
        </div>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Online</span>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 mb-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
              DEMO MODE ACTIVE
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-300/80">· High-Fidelity Simulation</span>
          </div>
          <p className="text-[11px] mt-0.5 text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Running with curated academic data & smart logic. Connect your Gemini API key in Secrets for live unrestricted generation.
          </p>
        </div>
      </div>
    </div>
  );
};
