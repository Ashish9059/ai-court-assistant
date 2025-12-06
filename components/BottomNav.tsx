import React from 'react';
import { View } from '../types';
import { Home, MessageSquare, Scale, FileSearch } from 'lucide-react';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.HOME, label: 'Home', icon: Home },
    { view: View.CHAT, label: 'Chat', icon: MessageSquare },
    { view: View.LAW_FINDER, label: 'Laws', icon: Scale },
    { view: View.DOCUMENT_ANALYZER, label: 'Analyze', icon: FileSearch },
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
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
