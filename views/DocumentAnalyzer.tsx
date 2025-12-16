import React, { useState } from 'react';
import { analyzeDocument } from '../services/gemini';
import { Upload, FileText, X, Loader2, ArrowLeft, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CommonViewProps } from '../types';

const DocumentAnalyzer: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
      title: language === 'en' ? 'Document Analyzer' : 'दस्तावेज़ विश्लेषक',
      uploadTitle: language === 'en' ? 'Upload Legal Document (PDF/Image)' : 'कानूनी दस्तावेज़ अपलोड करें (PDF/Image)',
      uploadDesc: language === 'en' ? 'Contracts, Notices, FIR copies, etc.' : 'अनुबंध, नोटिस, FIR प्रतियां, आदि।',
      selectFile: language === 'en' ? 'Select File' : 'फ़ाइल चुनें',
      analyzeBtn: language === 'en' ? 'Analyze with AI' : 'AI के साथ विश्लेषण करें',
      analyzing: language === 'en' ? 'Analyzing...' : 'विश्लेषण जारी...',
      result: language === 'en' ? 'Analysis Result' : 'विश्लेषण परिणाम',
      error: language === 'en' ? 'Error reading file.' : 'फ़ाइल पढ़ने में त्रुटि।',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
      } else {
          setPreview(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis('');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeDocument(base64String, file.type, language);
      setAnalysis(result);
      setLoading(false);
    };
    reader.onerror = () => {
        setAnalysis(t.error);
        setLoading(false);
    }
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-darkbg">
       <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            {onBack && <button onClick={onBack} className="text-slate-300 hover:text-white">
                <ArrowLeft size={24} />
            </button>}
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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!file ? (
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-cardbg/50">
            <Upload size={48} className="mb-4 text-blue-500" />
            <p className="mb-2 text-center">{t.uploadTitle}</p>
            <p className="text-xs text-slate-500 text-center mb-6">{t.uploadDesc}</p>
            
            <label className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <span>{t.selectFile}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div className="bg-cardbg rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="text-white text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setPreview(null); setAnalysis(''); }} 
                className="text-slate-400 hover:text-red-400"
              >
                <X size={20} />
              </button>
            </div>
            
            {preview && (
                <div className="mb-4 rounded-lg overflow-hidden border border-slate-700 max-h-48">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              <span>{loading ? t.analyzing : t.analyzeBtn}</span>
            </button>
          </div>
        )}

        {analysis && (
          <div className="bg-cardbg rounded-xl p-5 border border-slate-700 shadow-lg">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                <ShieldIcon className="mr-2" size={20} /> {t.result}
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icon
const ShieldIcon = ({className, size}: {className?: string, size: number}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
);

export default DocumentAnalyzer;
