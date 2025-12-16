import React from 'react';
import { View, Language, CommonViewProps } from '../types';
import { 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  Shield, 
  Clock, 
  Briefcase,
  ChevronRight,
  Globe
} from 'lucide-react';

interface HomeProps extends CommonViewProps {}

const Home: React.FC<HomeProps> = ({ setView, language, toggleLanguage }) => {
  const t = {
    title: language === 'en' ? 'Nyaya Sahayak' : 'न्याय सहायक',
    subtitle: language === 'en' ? 'Your AI Legal Assistant for Indian Law' : 'भारतीय कानून के लिए आपका एआई कानूनी सहायक',
    cardTitle: language === 'en' ? 'Have a legal doubt?' : 'क्या कोई कानूनी संदेह है?',
    cardDesc: language === 'en' ? 'Ask our AI chatbot about IPC, CrPC, or any legal advice.' : 'IPC, CrPC या किसी भी कानूनी सलाह के लिए हमारे AI चैटबॉट से पूछें।',
    askBtn: language === 'en' ? 'Ask AI Now' : 'अभी AI से पूछें',
    legalTools: language === 'en' ? 'Legal Tools' : 'कानूनी उपकरण',
    quickFind: language === 'en' ? 'Quick Find' : 'त्वरित खोज',
    offenceChecker: language === 'en' ? 'Offence Checker' : 'अपराध जांचकर्ता',
    bailableDesc: language === 'en' ? 'Is it bailable or cognizable?' : 'क्या यह जमानती है या संज्ञेय?',
    
    // Buttons
    fir: language === 'en' ? 'FIR Generator' : 'FIR जनरेटर',
    notice: language === 'en' ? 'Notice Generator' : 'नोटिस जनरेटर',
    summary: language === 'en' ? 'Case Summary' : 'केस सारांश',
    timeline: language === 'en' ? 'Court Timeline' : 'अदालती समयरेखा',
    rights: language === 'en' ? 'Your Rights' : 'आपके अधिकार',
    dictionary: language === 'en' ? 'Legal Dictionary' : 'कानूनी शब्दकोश',
  };

  const actions = [
    { label: t.fir, view: View.FIR_GENERATOR, icon: FileText, color: 'bg-red-500/20 text-red-400' },
    { label: t.notice, view: View.NOTICE_GENERATOR, icon: AlertTriangle, color: 'bg-orange-500/20 text-orange-400' },
    { label: t.summary, view: View.CASE_SUMMARY, icon: Briefcase, color: 'bg-purple-500/20 text-purple-400' },
    { label: t.timeline, view: View.TIMELINE, icon: Clock, color: 'bg-blue-500/20 text-blue-400' },
    { label: t.rights, view: View.RIGHTS, icon: Shield, color: 'bg-green-500/20 text-green-400' },
    { label: t.dictionary, view: View.DICTIONARY, icon: BookOpen, color: 'bg-teal-500/20 text-teal-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <header className="flex justify-between items-start mb-4">
        <div>
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </div>
        <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
        >
            <Globe size={14} />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </header>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-2">{t.cardTitle}</h2>
          <p className="text-blue-100 text-sm mb-4">{t.cardDesc}</p>
          <button 
            onClick={() => setView && setView(View.CHAT)}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors"
          >
            {t.askBtn}
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20">
           <Shield size={120} />
        </div>
      </div>

      <div>
        <h3 className="text-slate-200 font-semibold mb-3">{t.legalTools}</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.view}
              onClick={() => setView && setView(action.view)}
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
          <h3 className="text-slate-200 font-semibold">{t.quickFind}</h3>
        </div>
        <button 
          onClick={() => setView && setView(View.LAW_FINDER)}
          className="w-full flex items-center justify-between bg-darkbg p-3 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
             <div className="bg-pink-500/20 text-pink-400 p-2 rounded-lg">
               <Shield size={18} />
             </div>
             <div className="text-left">
               <div className="text-slate-200 text-sm font-medium">{t.offenceChecker}</div>
               <div className="text-slate-500 text-xs">{t.bailableDesc}</div>
             </div>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default Home;
