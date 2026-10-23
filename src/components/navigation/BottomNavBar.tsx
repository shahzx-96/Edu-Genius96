import React from 'react';
import { Home, MessageSquare, Sparkles, Bookmark, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, setActiveTool, language } = useApp();

  const isHindi = language === 'Hindi';

  const tabs = [
    {
      id: 'home' as const,
      label: isHindi ? 'होम' : 'Home',
      icon: Home,
    },
    {
      id: 'chat' as const,
      label: isHindi ? 'AI से पूछें' : 'Ask AI',
      icon: MessageSquare,
    },
    {
      id: 'tools' as const,
      label: isHindi ? 'टूल्स' : 'Tools',
      icon: Sparkles,
    },
    {
      id: 'saved' as const,
      label: isHindi ? 'सेव्ड' : 'Saved',
      icon: Bookmark,
    },
    {
      id: 'profile' as const,
      label: isHindi ? 'प्रोफाइल' : 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors"
      aria-label="Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // When clicking on tools tab without active tool, show tools menu
                if (tab.id !== 'tools') {
                  setActiveTool(null);
                }
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all duration-200 group active:scale-95 ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-purple-100 dark:bg-purple-950/60' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
