import React, { useEffect, useState } from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFade(true);
    }, 1800);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white transition-opacity duration-300 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transform transition-transform duration-700 hover:scale-105">
          <GraduationCap className="w-12 h-12 text-white stroke-[2.2]" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4 fill-amber-950" />
        </div>
      </div>

      <div className="text-center px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">EduGenius AI</h1>
        <p className="text-sm font-medium text-blue-100 tracking-wide max-w-xs mx-auto">
          Your Personal AI Teacher in Your Pocket.
        </p>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
        <span className="text-[11px] font-mono tracking-widest uppercase text-blue-200">Starting Engine</span>
      </div>
    </div>
  );
};
