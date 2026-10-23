import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/common/SplashScreen';
import { DeviceFrame } from './components/common/DeviceFrame';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ChatbotScreen } from './components/chat/ChatbotScreen';
import { ToolsScreen } from './components/tools/ToolsScreen';
import { SavedContentScreen } from './components/saved/SavedContentScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { DeliverablesHub } from './components/deliverables/DeliverablesHub';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab, showDeliverables, setShowDeliverables, user } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Deliverables Hub View (Code & Documentation)
  if (showDeliverables) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-30 p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">EduGenius AI Deliverables Explorer</span>
          <button
            onClick={() => setShowDeliverables(false)}
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
          >
            ← Return to App
          </button>
        </div>
        <DeliverablesHub />
      </div>
    );
  }

  // Active Screen Routing
  return (
    <>
      {activeTab === 'home' && <HomeDashboard />}
      {activeTab === 'chat' && <ChatbotScreen />}
      {activeTab === 'tools' && <ToolsScreen />}
      {activeTab === 'saved' && <SavedContentScreen />}
      {activeTab === 'profile' && <SettingsScreen />}

      {/* Auth Modal when user clicks login or signup */}
      <AuthModal isOpen={showAuthModal || !user} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <AppProvider>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <DeviceFrame>
        <AppContent />
      </DeviceFrame>
    </AppProvider>
  );
}
