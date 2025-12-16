import React, { useState } from 'react';
import { getTimelineResponse } from '../services/gemini';
import { ArrowLeft, Loader2, Clock, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CommonViewProps } from '../types';

const Timeline: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
  const [caseType, setCaseType] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
      title: language === 'en' ? 'Court Timeline' : 'अदालती समयरेखा',
      intro: language === 'en' ? 'Select a case type to understand the typical legal procedure and timeline in Indian Courts.' : 'भारतीय अदालतों में सामान्य कानूनी प्रक्रिया और समयरेखा को समझने के लिए एक मामला प्रकार चुनें।',
      btn: language === 'en' ? 'Generate Timeline' : 'समयरेखा बनाएं',
      checkAnother: language === 'en' ? 'Check Another' : 'दूसरा देखें',
  };
  
  const caseTypes = [
    { en: 'Criminal Case', hi: 'आपराधिक मामला' },
    { en: 'Civil Property Dispute', hi: 'सिविल संपत्ति विवाद' },
    { en: 'Cheque Bounce (138 NI)', hi: 'चेक बाउंस (138 NI)' },
    { en: 'Divorce Case', hi: 'तलाक का मामला' },
    { en: 'Bail Procedure', hi: 'जमानत प्रक्रिया' },
    { en: 'Consumer Complaint', hi: 'उपभोक्ता शिकायत' }
  ];

  const handleGenerate = async () => {
    if (!caseType) return;
    setLoading(true);
    try {
      const res = await getTimelineResponse(caseType, language);
      setResult(res);
    } catch (e) {
      setResult(language === 'en' ? "Error generating timeline." : "समयरेखा उत्पन्न करने में त्रुटि।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkbg">
      <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <button onClick={onBack} className="text-slate-300 hover:text-white">
            <ArrowLeft size={24} />
            </button>
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
        {!result ? (
           <div className="space-y-4">
               <p className="text-slate-400 text-sm">{t.intro}</p>
               
               <div className="grid grid-cols-2 gap-3">
                   {caseTypes.map((type) => (
                       <button
                         key={type.en}
                         onClick={() => { setCaseType(type.en); }}
                         className={`p-4 rounded-lg border text-sm font-medium text-left transition-colors ${caseType === type.en ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                       >
                           {language === 'en' ? type.en : type.hi}
                       </button>
                   ))}
               </div>

               <div className="pt-2">
                   <button
                        onClick={handleGenerate}
                        disabled={loading || !caseType}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                   >
                       {loading ? <Loader2 className="animate-spin" /> : <Clock size={20} />}
                       <span>{t.btn}</span>
                   </button>
               </div>
           </div>
        ) : (
            <div className="bg-cardbg rounded-xl p-5 border border-slate-700">
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <button onClick={() => setResult('')} className="mt-6 w-full border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-800">
                    {t.checkAnother}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
