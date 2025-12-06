import React, { useState } from 'react';
import { generateLegalNotice } from '../services/gemini';
import { ArrowLeft, Loader2, Copy } from 'lucide-react';
import { NoticeType } from '../types';

interface NoticeGeneratorProps {
  onBack: () => void;
}

const NoticeGenerator: React.FC<NoticeGeneratorProps> = ({ onBack }) => {
  const [type, setType] = useState<NoticeType | ''>('');
  const [details, setDetails] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!type || !details) return;
    setLoading(true);
    try {
      const res = await generateLegalNotice(type, details);
      setResult(res);
    } catch (e) {
      setResult("Error generating notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkbg">
      <div className="p-4 bg-cardbg border-b border-slate-700 flex items-center space-x-3">
        <button onClick={onBack} className="text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">Legal Notice Generator</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!result ? (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-2">Notice Type</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none appearance-none"
                        value={type}
                        onChange={e => setType(e.target.value as NoticeType)}
                    >
                        <option value="">Select Type...</option>
                        {Object.values(NoticeType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-2">Case Details</label>
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-40 focus:border-orange-500 focus:outline-none"
                        placeholder="Enter amount, dates, names, agreement details, etc."
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
                    <span>Draft Legal Notice</span>
                </button>
            </div>
        ) : (
            <div className="bg-cardbg rounded-xl border border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white">Legal Notice Draft</h3>
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
                        Draft Another
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default NoticeGenerator;
