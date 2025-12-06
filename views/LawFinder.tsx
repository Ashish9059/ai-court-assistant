import React, { useState } from 'react';
import { getLawFinderResponse } from '../services/gemini';
import { Search, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { View } from '../types';

interface LawFinderProps {
  onBack: () => void;
}

const LawFinder: React.FC<LawFinderProps> = ({ onBack }) => {
  const [incident, setIncident] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!incident.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await getLawFinderResponse(incident);
      setResult(response);
    } catch (error) {
      setResult("Error fetching legal data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkbg overflow-hidden">
      <div className="p-4 bg-cardbg border-b border-slate-700 flex items-center space-x-3">
        <button onClick={onBack} className="text-slate-300 hover:text-white">
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">Law Finder</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Describe the incident:</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 min-h-[120px]"
            placeholder="e.g., My neighbor is threatening me over a parking spot and damaged my car..."
            value={incident}
            onChange={(e) => setIncident(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !incident}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            <span>Find Applicable Laws</span>
          </button>
        </div>

        {result && (
          <div className="bg-cardbg rounded-xl p-5 border border-slate-700 shadow-lg animate-fade-in">
             <h3 className="text-lg font-bold text-blue-400 mb-3">Legal Analysis</h3>
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
