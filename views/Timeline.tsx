import React, { useState } from 'react';
import { getTimelineResponse } from '../services/gemini';
import { ArrowLeft, Loader2, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TimelineProps {
  onBack: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ onBack }) => {
  const [caseType, setCaseType] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!caseType) return;
    setLoading(true);
    try {
      const res = await getTimelineResponse(caseType);
      setResult(res);
    } catch (e) {
      setResult("Error generating timeline.");
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
        <h2 className="text-lg font-bold text-white">Court Timeline</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!result ? (
           <div className="space-y-4">
               <p className="text-slate-400 text-sm">Select a case type to understand the typical legal procedure and timeline in Indian Courts.</p>
               
               <div className="grid grid-cols-2 gap-3">
                   {['Criminal Case', 'Civil Property Dispute', 'Cheque Bounce (138 NI)', 'Divorce Case', 'Bail Procedure', 'Consumer Complaint'].map((type) => (
                       <button
                         key={type}
                         onClick={() => { setCaseType(type); }}
                         className={`p-4 rounded-lg border text-sm font-medium text-left transition-colors ${caseType === type ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                       >
                           {type}
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
                       <span>Generate Timeline</span>
                   </button>
               </div>
           </div>
        ) : (
            <div className="bg-cardbg rounded-xl p-5 border border-slate-700">
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <button onClick={() => setResult('')} className="mt-6 w-full border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-800">
                    Check Another
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
