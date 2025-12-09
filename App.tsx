import React, { useState } from 'react';
import { View, Language, CommonViewProps } from './types';
import BottomNav from './components/BottomNav';
import Home from './views/Home';
import Chat from './views/Chat';
import LawFinder from './views/LawFinder';
import DocumentAnalyzer from './views/DocumentAnalyzer';
import FIRGenerator from './views/FIRGenerator';
import NoticeGenerator from './views/NoticeGenerator';
import Timeline from './views/Timeline';
import { generateLegalResponse } from './services/gemini';
import { ArrowLeft, Book, ShieldAlert, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- StaticInfoView Wrapper for Rights/Dictionary ---

interface StaticInfoProps extends CommonViewProps {
    titleEn: string;
    titleHi: string;
    promptEn: string;
    promptHi: string;
}

const StaticInfoView: React.FC<StaticInfoProps> = ({ titleEn, titleHi, promptEn, promptHi, onBack, language, toggleLanguage }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        setLoading(true);
        // We pass the prompt based on language directly to the basic generator, 
        // or we use generateLegalResponse with language param to ensure proper handling.
        const prompt = language === 'en' ? promptEn : promptHi;
        // Even if we pass Hindi prompt, we pass 'language' so it knows to post-process if needed
        generateLegalResponse(prompt, language).then(setContent).finally(() => setLoading(false));
    }, [promptEn, promptHi, language]);

    return (
        <div className="flex flex-col h-full bg-darkbg">
            <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="text-slate-300 hover:text-white"><ArrowLeft size={24} /></button>
                    <h2 className="text-lg font-bold text-white">{language === 'en' ? titleEn : titleHi}</h2>
                </div>
                 <button 
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
                >
                    <Globe size={14} />
                    <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Case Summary View ---

const CaseSummary: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const t = {
        title: language === 'en' ? 'Case Summary' : 'केस सारांश',
        placeholder: language === 'en' ? 'Paste case details or legal text here...' : 'केस का विवरण या कानूनी पाठ यहाँ पेस्ट करें...',
        btn: language === 'en' ? 'Generate Summary' : 'सारांश उत्पन्न करें',
        btnLoading: language === 'en' ? 'Summarizing...' : 'सारांश बना रहा है...',
        newBtn: language === 'en' ? 'New Summary' : 'नया सारांश',
    }

    const handleSummarize = async () => {
        if (!text) return;
        setLoading(true);
        const prompt = `Summarize this legal case/text. Identify key arguments, defence points, and evidence: \n\n ${text}`;
        try {
            const res = await generateLegalResponse(prompt, language);
            setSummary(res);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-darkbg">
            <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="text-slate-300 hover:text-white"><ArrowLeft size={24} /></button>
                    <h2 className="text-lg font-bold text-white">{t.title}</h2>
                </div>
                 <button 
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
                >
                    <Globe size={14} />
                    <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!summary ? (
                    <>
                        <textarea 
                            className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            placeholder={t.placeholder}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button 
                            onClick={handleSummarize} 
                            disabled={loading || !text}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? t.btnLoading : t.btn}
                        </button>
                    </>
                ) : (
                    <div className="bg-cardbg p-4 rounded-xl border border-slate-700">
                        <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div>
                        <button onClick={() => setSummary('')} className="mt-4 w-full border border-slate-600 text-slate-300 py-2 rounded-lg">
                            {t.newBtn}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Main App ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const commonProps = {
      language,
      toggleLanguage,
      setView: setCurrentView,
  };

  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} {...commonProps} />;
      case View.CHAT:
        return <Chat {...commonProps} />;
      case View.LAW_FINDER:
        return <LawFinder onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.DOCUMENT_ANALYZER:
        return <DocumentAnalyzer onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.FIR_GENERATOR:
        return <FIRGenerator onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.NOTICE_GENERATOR:
        return <NoticeGenerator onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.TIMELINE:
        return <Timeline onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.CASE_SUMMARY:
          return <CaseSummary onBack={() => setCurrentView(View.HOME)} {...commonProps} />;
      case View.RIGHTS:
          return <StaticInfoView 
              titleEn="Know Your Rights" 
              titleHi="अपने अधिकार जानें"
              onBack={() => setCurrentView(View.HOME)}
              promptEn="List and explain Fundamental Rights in India, Arrest Rights, Women's Rights, and Cybercrime reporting rules concisely."
              promptHi="भारत में मौलिक अधिकारों, गिरफ्तारी के अधिकारों, महिलाओं के अधिकारों और साइबर अपराध रिपोर्टिंग नियमों को संक्षेप में सूचीबद्ध करें और समझाएं।"
              {...commonProps}
          />;
      case View.DICTIONARY:
          return <StaticInfoView 
              titleEn="Legal Dictionary" 
              titleHi="कानूनी शब्दकोश"
              onBack={() => setCurrentView(View.HOME)}
              promptEn="Provide a dictionary of top 20 common Indian legal terms (e.g., Bail, FIR, Cognizable, Vakalatnama, Stay Order, Decreee) with simple explanations."
              promptHi="भारत के शीर्ष 20 सामान्य कानूनी शब्दों (जैसे जमानत, एफआईआर, संज्ञेय, वकालतनामा, स्टे ऑर्डर, डिक्री) का शब्दकोश सरल स्पष्टीकरण के साथ प्रदान करें।"
              {...commonProps}
          />;
      default:
        return <Home setView={setCurrentView} {...commonProps} />;
    }
  };

  const isBottomNavVisible = [
    View.HOME, 
    View.CHAT, 
    View.LAW_FINDER, 
    View.DOCUMENT_ANALYZER
  ].includes(currentView);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-darkbg shadow-2xl overflow-hidden border-x border-slate-800 relative">
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {renderContent()}
      </main>
      
      {isBottomNavVisible && (
        <BottomNav currentView={currentView} setView={setCurrentView} language={language} />
      )}
    </div>
  );
};

export default App;