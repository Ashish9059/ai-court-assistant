import React from 'react';
import { View } from '../types';
import { 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  Shield, 
  Clock, 
  Briefcase,
  ChevronRight 
} from 'lucide-react';

interface HomeProps {
  setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const actions = [
    { label: 'FIR Generator', view: View.FIR_GENERATOR, icon: FileText, color: 'bg-red-500/20 text-red-400' },
    { label: 'Notice Generator', view: View.NOTICE_GENERATOR, icon: AlertTriangle, color: 'bg-orange-500/20 text-orange-400' },
    { label: 'Case Summary', view: View.CASE_SUMMARY, icon: Briefcase, color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Court Timeline', view: View.TIMELINE, icon: Clock, color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Your Rights', view: View.RIGHTS, icon: Shield, color: 'bg-green-500/20 text-green-400' },
    { label: 'Legal Dictionary', view: View.DICTIONARY, icon: BookOpen, color: 'bg-teal-500/20 text-teal-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nyaya Sahayak</h1>
        <p className="text-slate-400 text-sm">Your AI Legal Assistant for Indian Law</p>
      </header>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-2">Have a legal doubt?</h2>
          <p className="text-blue-100 text-sm mb-4">Ask our AI chatbot about IPC, CrPC, or any legal advice.</p>
          <button 
            onClick={() => setView(View.CHAT)}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors"
          >
            Ask AI Now
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20">
           <Shield size={120} />
        </div>
      </div>

      <div>
        <h3 className="text-slate-200 font-semibold mb-3">Legal Tools</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => setView(action.view)}
              className="bg-cardbg p-4 rounded-xl shadow-sm border border-slate-700/50 flex flex-col items-start hover:bg-slate-800 transition-colors"
            >
              <div className={`p-2 rounded-lg mb-3 ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="text-slate-200 font-medium text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cardbg rounded-xl p-4 border border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-slate-200 font-semibold">Quick Find</h3>
        </div>
        <button 
          onClick={() => setView(View.LAW_FINDER)}
          className="w-full flex items-center justify-between bg-darkbg p-3 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
             <div className="bg-pink-500/20 text-pink-400 p-2 rounded-lg">
               <Shield size={18} />
             </div>
             <div className="text-left">
               <div className="text-slate-200 text-sm font-medium">Offence Checker</div>
               <div className="text-slate-500 text-xs">Is it bailable or cognizable?</div>
             </div>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default Home;
