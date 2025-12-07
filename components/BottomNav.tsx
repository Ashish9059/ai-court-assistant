import React from 'react';
import { View, Language } from '../types';
import { Home, MessageSquare, Scale, FileSearch } from 'lucide-react';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
  language: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, language }) => {
  const labels = {
    [View.HOME]: language === 'en' ? 'Home' : 'मुख्य पृष्ठ',
    [View.CHAT]: language === 'en' ? 'Chat' : 'चैट',
    [View.LAW_FINDER]: language === 'en' ? 'Laws' : 'कानून',
    [View.DOCUMENT_ANALYZER]: language === 'en' ? 'Analyze' : 'विश्लेषण',
  };

  const navItems = [
    { view: View.HOME, icon: Home },
    { view: View.CHAT, icon: MessageSquare },
    { view: View.LAW_FINDER, icon: Scale },
    { view: View.DOCUMENT_ANALYZER, icon: FileSearch },
  ];

  return (
    <div className="bg-cardbg border-t border-slate-700 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{labels[item.view]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
