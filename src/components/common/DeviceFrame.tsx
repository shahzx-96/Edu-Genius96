import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Maximize2,
  FolderCode,
  Languages,
  Moon,
  Sun,
  Laptop,
  Wifi,
  WifiOff,
  Battery,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BottomNavBar } from '../navigation/BottomNavBar';
import { AppTheme, ResponseLanguage } from '../../types';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const {
    deviceMode,
    setDeviceMode,
    showDeliverables,
    setShowDeliverables,
    language,
    setLanguage,
    theme,
    setTheme,
    isDemoMode,
    aiModelName,
    isOnline,
    toggleSimulateOffline,
  } = useApp();

  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Frame width mappings
  let containerWidthClass = 'w-full max-w-[412px] h-[860px] max-h-[92vh]'; // standard Android 6.1"
  if (deviceMode === 'phone-large') {
    containerWidthClass = 'w-full max-w-[440px] h-[920px] max-h-[95vh]';
  } else if (deviceMode === 'tablet') {
    containerWidthClass = 'w-full max-w-[780px] h-[880px] max-h-[92vh]';
  } else if (deviceMode === 'full') {
    containerWidthClass = 'w-full min-h-screen';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 md:p-3 selection:bg-purple-500/20">
      {/* Top Studio Control Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 border-b border-slate-800/80 mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-sm shadow-md">
              EG
            </div>
            <div>
              <span className="text-xs font-extrabold tracking-tight text-white block">EduGenius AI</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Android Flutter Engine</span>
            </div>
          </div>

          {/* Demo mode status pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isDemoMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span>{isDemoMode ? 'DEMO MODE' : 'LIVE GEMINI'}</span>
          </div>
        </div>

        {/* Center / Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Deliverables Hub Toggle Button */}
          <button
            onClick={() => setShowDeliverables(!showDeliverables)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
              showDeliverables
                ? 'bg-purple-600 text-white shadow-purple-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
            }`}
          >
            <FolderCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Code & Docs Hub</span>
            <span className="sm:hidden">Deliverables</span>
          </button>

          {/* Language Quick Dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            {(['English', 'Hindi', 'Hinglish'] as ResponseLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  language === l ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l === 'English' ? 'EN' : l === 'Hindi' ? 'HI' : 'HING'}
              </button>
            ))}
          </div>

          {/* Network State & Offline Simulation Toggle */}
          <button
            onClick={toggleSimulateOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title={
              !isOnline
                ? 'Offline mode active (Click to simulate online connection)'
                : 'Online (Click to simulate offline mode)'
            }
          >
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{!isOnline ? 'Offline' : 'Online'}</span>
          </button>

          {/* Theme Quick Switcher */}
          <button
            onClick={() => {
              const next: AppTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={`Toggle Theme (Current: ${theme})`}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Device viewport mode switcher */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setDeviceMode('phone')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'phone' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Phone 6.1-inch"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'tablet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Tablet 10.5-inch"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('full')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                deviceMode === 'full' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Window Viewport"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex items-center justify-center flex-1">
        {deviceMode === 'full' ? (
          <div className="w-full max-w-6xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-none md:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[85vh]">
            <div className="flex-1 overflow-y-auto">{children}</div>
            <BottomNavBar />
          </div>
        ) : (
          <div
            className={`relative ${containerWidthClass} bg-slate-50 dark:bg-slate-900 rounded-[38px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[9px] border-slate-800 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-slate-700/50`}
          >
            {/* Android Dynamic Camera Cutout & Status Bar */}
            <div className="h-9 px-6 pt-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between text-slate-800 dark:text-slate-200 z-40 shrink-0 select-none">
              <span className="font-mono text-xs font-semibold">{currentTime}</span>

              {/* Camera punch hole */}
              <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-950/80"></div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="text-[10px] font-bold tracking-tight">
                  {isOnline ? '5G' : 'OFFLINE'}
                </span>
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-emerald-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-amber-500" />
                )}
                <Battery className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Screen Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-slate-50 dark:bg-slate-900">
              {children}
            </div>

            {/* Bottom Nav */}
            <BottomNavBar />

            {/* Android Home Navigation Bar Pill */}
            <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
              <div className="w-28 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
