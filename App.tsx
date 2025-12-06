import React, { useState } from 'react';
import { View } from './types';
import BottomNav from './components/BottomNav';
import Home from './views/Home';
import Chat from './views/Chat';
import LawFinder from './views/LawFinder';
import DocumentAnalyzer from './views/DocumentAnalyzer';
import FIRGenerator from './views/FIRGenerator';
import NoticeGenerator from './views/NoticeGenerator';
import Timeline from './views/Timeline';
import { generateLegalResponse } from './services/gemini';
import { ArrowLeft, Book, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Simple placeholder views for Rights and Dictionary to keep file count managed within limit
// while fulfilling requirements.

const StaticInfoView: React.FC<{ title: string; prompt: string; onBack: () => void }> = ({ title, prompt, onBack }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        generateLegalResponse(prompt).then(setContent).finally(() => setLoading(false));
    }, [prompt]);

    return (
        <div className="flex flex-col h-full bg-darkbg">
            <div className="p-4 bg-cardbg border-b border-slate-700 flex items-center space-x-3">
                <button onClick={onBack} className="text-slate-300 hover:text-white"><ArrowLeft size={24} /></button>
                <h2 className="text-lg font-bold text-white">{title}</h2>
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

const CaseSummary: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        if (!text) return;
        setLoading(true);
        const prompt = `Summarize this legal case/text. Identify key arguments, defence points, and evidence: \n\n ${text}`;
        try {
            const res = await generateLegalResponse(prompt);
            setSummary(res);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-darkbg">
            <div className="p-4 bg-cardbg border-b border-slate-700 flex items-center space-x-3">
                <button onClick={onBack} className="text-slate-300 hover:text-white"><ArrowLeft size={24} /></button>
                <h2 className="text-lg font-bold text-white">Case Summary</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!summary ? (
                    <>
                        <textarea 
                            className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            placeholder="Paste case details or legal text here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button 
                            onClick={handleSummarize} 
                            disabled={loading || !text}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Summarizing...' : 'Generate Summary'}
                        </button>
                    </>
                ) : (
                    <div className="bg-cardbg p-4 rounded-xl border border-slate-700">
                        <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div>
                        <button onClick={() => setSummary('')} className="mt-4 w-full border border-slate-600 text-slate-300 py-2 rounded-lg">New Summary</button>
                    </div>
                )}
            </div>
        </div>
    )
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);

  // Helper to render the main content area
  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} />;
      case View.CHAT:
        return <Chat />;
      case View.LAW_FINDER:
        return <LawFinder onBack={() => setCurrentView(View.HOME)} />;
      case View.DOCUMENT_ANALYZER:
        return <DocumentAnalyzer onBack={() => setCurrentView(View.HOME)} />;
      case View.FIR_GENERATOR:
        return <FIRGenerator onBack={() => setCurrentView(View.HOME)} />;
      case View.NOTICE_GENERATOR:
        return <NoticeGenerator onBack={() => setCurrentView(View.HOME)} />;
      case View.TIMELINE:
        return <Timeline onBack={() => setCurrentView(View.HOME)} />;
      case View.CASE_SUMMARY:
          return <CaseSummary onBack={() => setCurrentView(View.HOME)} />;
      case View.RIGHTS:
          return <StaticInfoView 
              title="Know Your Rights" 
              onBack={() => setCurrentView(View.HOME)}
              prompt="List and explain Fundamental Rights in India, Arrest Rights, Women's Rights, and Cybercrime reporting rules concisely."
          />;
      case View.DICTIONARY:
          return <StaticInfoView 
              title="Legal Dictionary" 
              onBack={() => setCurrentView(View.HOME)}
              prompt="Provide a dictionary of top 20 common Indian legal terms (e.g., Bail, FIR, Cognizable, Vakalatnama, Stay Order, Decreee) with simple explanations."
          />;
      default:
        return <Home setView={setCurrentView} />;
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
        <BottomNav currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;
