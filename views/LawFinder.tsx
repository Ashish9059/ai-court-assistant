import React, { useState } from 'react';
import { getLawFinderResponse } from '../services/gemini';
import { Search, ArrowLeft, Loader2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CommonViewProps } from '../types';

const LawFinder: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
  const [incident, setIncident] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
      title: language === 'en' ? 'Law Finder' : 'कानून खोजक',
      label: language === 'en' ? 'Describe the incident:' : 'घटना का वर्णन करें:',
      placeholder: language === 'en' 
        ? 'e.g., My neighbor is threatening me over a parking spot and damaged my car...' 
        : 'उदाहरण: मेरा पड़ोसी मुझे पार्किंग को लेकर धमकी दे रहा है और उसने मेरी कार को नुकसान पहुंचाया है...',
      button: language === 'en' ? 'Find Applicable Laws' : 'लागू कानून खोजें',
      loading: language === 'en' ? 'Analyzing...' : 'विश्लेषण कर रहा है...',
      resultTitle: language === 'en' ? 'Legal Analysis' : 'कानूनी विश्लेषण',
      error: language === 'en' ? "Error fetching legal data." : "कानूनी डेटा लाने में त्रुटि।"
  };

  const handleSearch = async () => {
    if (!incident.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await getLawFinderResponse(incident, language);
      setResult(response);
    } catch (error) {
      setResult(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkbg overflow-hidden">
      <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            {onBack && (
                <button onClick={onBack} className="text-slate-300 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
            )}
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
        <div className="space-y-2">
          <label className="text-sm text-slate-400">{t.label}</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[120px]"
            placeholder={t.placeholder}
            value={incident}
            onChange={(e) => setIncident(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !incident}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            <span>{loading ? t.loading : t.button}</span>
          </button>
        </div>

        {result && (
          <div className="bg-cardbg rounded-xl p-5 border border-slate-700 shadow-lg animate-fade-in">
             <h3 className="text-lg font-bold text-blue-400 mb-3">{t.resultTitle}</h3>
             <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawFinder;
