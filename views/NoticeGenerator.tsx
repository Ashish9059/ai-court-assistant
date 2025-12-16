import React, { useState } from 'react';
import { generateLegalNotice } from '../services/gemini';
import { ArrowLeft, Loader2, Copy, Globe } from 'lucide-react';
import { NoticeType, CommonViewProps } from '../types';

const NoticeGenerator: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
  const [type, setType] = useState<NoticeType | ''>('');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
      title: language === 'en' ? 'Legal Notice Generator' : 'कानूनी नोटिस जनरेटर',
      typeLabel: language === 'en' ? 'Notice Type' : 'नोटिस का प्रकार',
      detailsLabel: language === 'en' ? 'Case Details' : 'मामले का विवरण',
      placeholder: language === 'en' ? 'Enter amount, dates, names, agreement details, etc.' : 'राशि, तिथियां, नाम, समझौते का विवरण आदि दर्ज करें।',
      btn: language === 'en' ? 'Draft Legal Notice' : 'कानूनी नोटिस ड्राफ्ट करें',
      select: language === 'en' ? 'Select Type...' : 'प्रकार चुनें...',
      resultTitle: language === 'en' ? 'Legal Notice Draft' : 'कानूनी नोटिस ड्राफ्ट',
      draftAnother: language === 'en' ? 'Draft Another' : 'दूसरा ड्राफ्ट बनाएं',
      loading: language === 'en' ? 'Drafting...' : 'ड्राफ्टिंग जारी...',
  };

  const handleGenerate = async () => {
    if (!type || !details) return;
    setLoading(true);
    try {
      const res = await generateLegalNotice(type, details, language);
      setResult(res);
    } catch (e) {
      setResult(language === 'en' ? "Error generating notice." : "नोटिस उत्पन्न करने में त्रुटि।");
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
                <div>
                    <label className="block text-xs text-slate-400 mb-2">{t.typeLabel}</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none appearance-none"
                        value={type}
                        onChange={e => setType(e.target.value as NoticeType)}
                    >
                        <option value="">{t.select}</option>
                        {Object.values(NoticeType).map(tVal => (
                            <option key={tVal} value={tVal}>{tVal}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-2">{t.detailsLabel}</label>
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-40 focus:border-orange-500 focus:outline-none"
                        placeholder={t.placeholder}
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !type}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors flex justify-center items-center space-x-2"
                >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    <span>{loading ? t.loading : t.btn}</span>
                </button>
            </div>
        ) : (
            <div className="bg-cardbg rounded-xl border border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">{t.resultTitle}</h3>
                    <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="text-orange-400 text-sm flex items-center gap-1 hover:text-orange-300"
                    >
                        <Copy size={16} /> Copy
                    </button>
                </div>
                <div className="p-4 overflow-y-auto whitespace-pre-wrap text-slate-300 text-sm font-mono">
                    {result}
                </div>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={() => setResult('')} className="w-full border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-800">
                        {t.draftAnother}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default NoticeGenerator;
