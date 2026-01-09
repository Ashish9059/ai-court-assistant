
import React, { useState, useEffect } from 'react';
import { generateFIRDraft, translateText } from '../services/gemini';
import { ArrowLeft, Loader2, Copy, Save, Trash2, History as HistoryIcon, Edit, Plus, FileText, Share2, AlertCircle, ChevronLeft, ChevronRight, Download, Globe, Mic, MicOff } from 'lucide-react';
import { FIRFormData, CommonViewProps, IncidentType } from '../types';
import { jsPDF } from "jspdf";

interface SavedDraft {
  id: string;
  timestamp: number;
  formData: FIRFormData;
  content: string;
  name?: string;
}

const initialFormState: FIRFormData = {
  complainant: '',
  accused: '',
  dateTime: '',
  incidentType: '',
  incidentDetails: '',
  evidence: '',
};

const ITEMS_PER_PAGE = 5;

const FIRGenerator: React.FC<CommonViewProps> = ({ onBack, language, toggleLanguage }) => {
  const [formData, setFormData] = useState<FIRFormData>(initialFormState);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof FIRFormData, string>>>({});
  
  // Speech Recognition State
  const [listeningField, setListeningField] = useState<keyof FIRFormData | null>(null);

  const t = {
      title: language === 'en' ? 'FIR Draft Generator' : 'FIR जनरेटर',
      historyTitle: language === 'en' ? 'Saved Drafts' : 'सहेजे गए ड्राफ्ट',
      complainant: language === 'en' ? 'Complainant Name' : 'शिकायतकर्ता का नाम',
      accused: language === 'en' ? 'Accused Details' : 'आरोपी का विवरण',
      dateTime: language === 'en' ? 'Date & Time of Incident' : 'घटना की तारीख और समय',
      incidentType: language === 'en' ? 'Type of Incident' : 'घटना का प्रकार',
      details: language === 'en' ? 'Detailed Incident Description' : 'घटना का विस्तृत विवरण',
      evidence: language === 'en' ? 'Evidence Available (Optional)' : 'उपलब्ध सबूत (वैकल्पिक)',
      generateBtn: language === 'en' ? 'Generate FIR Draft' : 'FIR ड्राफ्ट उत्पन्न करें',
      generating: language === 'en' ? 'Generating...' : 'उत्पन्न हो रहा है...',
      viewHistory: language === 'en' ? 'View Saved Drafts' : 'सहेजे गए ड्राफ्ट देखें',
      generatedTitle: language === 'en' ? 'Generated FIR' : 'उत्पन्न FIR',
      edit: language === 'en' ? 'Edit Details' : 'विवरण संपादित करें',
      new: language === 'en' ? 'New Draft' : 'नया ड्राफ्ट',
      noDrafts: language === 'en' ? 'No saved drafts found.' : 'कोई सहेजे गए ड्राफ्ट नहीं मिले।',
      createFirst: language === 'en' ? 'Create a new FIR' : 'नया FIR बनाएं',
      phComplainant: language === 'en' ? 'e.g. Ramesh Kumar' : 'उदाहरण: रमेश कुमार',
      phAccused: language === 'en' ? 'e.g. Suresh Singh, aged 40' : 'उदाहरण: सुरेश सिंह, उम्र 40',
      phDetails: language === 'en' ? 'Describe what happened clearly...' : 'जो हुआ उसका स्पष्ट वर्णन करें...',
      phEvidence: language === 'en' ? 'Witnesses, CCTV, Photos' : 'गवाह, सीसीटीवी, तस्वीरें',
      errReq: language === 'en' ? 'Required' : 'अनिवार्य',
      savePrompt: language === 'en' ? 'Save Draft as:' : 'ड्राफ्ट को इस नाम से सहेजें:',
      savedAlert: language === 'en' ? 'Draft saved to History!' : 'इतिहास में ड्राफ्ट सहेजा गया!',
      copyAlert: language === 'en' ? 'Draft copied to clipboard!' : 'ड्राफ्ट क्लिपबोर्ड पर कॉपी किया गया!',
      deleteConfirm: language === 'en' ? 'Are you sure you want to delete this draft?' : 'क्या आप वाकई इस ड्राफ्ट को हटाना चाहते हैं?',
      micError: language === 'en' ? 'Speech recognition not supported in this browser.' : 'इस ब्राउज़र में वाक् पहचान समर्थित नहीं है।',
      listening: language === 'en' ? 'Listening...' : 'सुन रहा हूँ...',
      selectType: language === 'en' ? 'Select incident type...' : 'घटना का प्रकार चुनें...',
  };

  const incidentTypesMap: Record<string, { en: string; hi: string }> = {
    [IncidentType.ASSAULT]: { en: 'Assault / Physical Violence', hi: 'हमला / शारीरिक हिंसा' },
    [IncidentType.THEFT]: { en: 'Theft / Robbery', hi: 'चोरी / डकैती' },
    [IncidentType.FRAUD]: { en: 'Fraud / Financial Crime', hi: 'धोखाधड़ी / वित्तीय अपराध' },
    [IncidentType.CYBERCRIME]: { en: 'Cybercrime', hi: 'साइबर अपराध' },
    [IncidentType.HARASSMENT]: { en: 'Harassment / Stalking', hi: 'उत्पीड़न / पीछा करना' },
    [IncidentType.PROPERTY_DAMAGE]: { en: 'Property Damage / Vandalism', hi: 'संपत्ति का नुकसान / तोड़फोड़' },
    [IncidentType.DOMESTIC_VIOLENCE]: { en: 'Domestic Violence', hi: 'घरेलू हिंसा' },
    [IncidentType.CHEQUE_BOUNCE]: { en: 'Cheque Bounce', hi: 'चेक बाउंस' },
    [IncidentType.OTHER]: { en: 'Other', hi: 'अन्य' },
  };

  const loadDrafts = async () => {
    setLoadingHistory(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const saved = localStorage.getItem('nyaya_fir_drafts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            setSavedDrafts(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved drafts", e);
      }
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (showHistory) {
        loadDrafts();
        setCurrentPage(1);
    }
  }, [showHistory]);

  const saveToStorage = (drafts: SavedDraft[]) => {
    localStorage.setItem('nyaya_fir_drafts', JSON.stringify(drafts));
    setSavedDrafts(drafts);
    
    const newTotalPages = Math.ceil(drafts.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
    }
  };

  const handleChange = (field: keyof FIRFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const startListening = (field: keyof FIRFormData) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert(t.micError);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListeningField(field);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListeningField(null);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      let textToUse = transcript;

      if (language === 'hi') {
        try {
          textToUse = await translateText(transcript, 'en');
        } catch (error) {
          console.error('Translation error during STT:', error);
          textToUse = transcript;
        }
      }

      setFormData(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]} ${textToUse}`.trim() : textToUse
      }));
    };

    recognition.start();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FIRFormData, string>> = {};
    let isValid = true;

    if (!formData.complainant.trim()) {
        newErrors.complainant = t.errReq;
        isValid = false;
    }

    if (!formData.dateTime) {
        newErrors.dateTime = t.errReq;
        isValid = false;
    }

    if (!formData.incidentType) {
        newErrors.incidentType = t.errReq;
        isValid = false;
    }

    if (!formData.incidentDetails.trim()) {
        newErrors.incidentDetails = t.errReq;
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await generateFIRDraft(formData, language);
      setDraft(result);
    } catch (e) {
      setDraft(language === 'en' ? "Error generating FIR." : "FIR उत्पन्न करने में त्रुटि।");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    if (!draft) return;

    const defaultName = `${formData.complainant} - ${new Date().toLocaleDateString()}`;
    const name = window.prompt(t.savePrompt, defaultName);
    
    if (name === null) return;

    const newDraft: SavedDraft = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        formData: { ...formData },
        content: draft,
        name: name || defaultName
    };
    
    const currentSaved = localStorage.getItem('nyaya_fir_drafts');
    let currentList: SavedDraft[] = [];
    if (currentSaved) {
        try { currentList = JSON.parse(currentSaved); } catch(e) {}
    }
    
    const updated = [newDraft, ...currentList];
    saveToStorage(updated);
    alert(t.savedAlert);
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm(t.deleteConfirm)) {
        const updated = savedDrafts.filter(d => d.id !== id);
        saveToStorage(updated);
    }
  };

  const handleLoadDraft = (saved: SavedDraft) => {
    setFormData(saved.formData);
    setDraft(saved.content);
    setErrors({});
    setShowHistory(false);
  };

  const handleEditDraftFromHistory = (e: React.MouseEvent, saved: SavedDraft) => {
    e.stopPropagation();
    setFormData(saved.formData);
    setDraft('');
    setErrors({});
    setShowHistory(false);
  };

  const handleStartNew = () => {
    setFormData(initialFormState);
    setDraft('');
    setErrors({});
  }

  const handleEditCurrent = () => {
    setDraft('');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert(t.copyAlert);
  }

  // Fix: Implemented handleShare to allow users to share the generated draft
  const handleShare = async () => {
    if (!draft) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FIR Draft from Nyaya Sahayak',
          text: draft,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  // Fix: Implemented handleShareHistoryItem to allow sharing specific drafts from history
  const handleShareHistoryItem = async (e: React.MouseEvent, item: SavedDraft) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name || 'FIR Draft from Nyaya Sahayak',
          text: item.content,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(item.content);
      alert(t.copyAlert);
    }
  };

  const handleDownloadPDF = (content: string, complainantName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
        const doc = new jsPDF();
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxLineWidth = pageWidth - margin * 2;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("First Information Report (Draft)", margin, margin);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 8);

        doc.setFontSize(11);
        doc.setTextColor(0);
        
        const lines = doc.splitTextToSize(content, maxLineWidth);
        let cursorY = margin + 20;

        lines.forEach((line: string) => {
            if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        const safeName = complainantName.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
        doc.save(`FIR_Draft_${safeName}.pdf`);
    } catch (err) {
        alert("Could not generate PDF. Please try again.");
    }
  };

  const totalPages = Math.ceil(savedDrafts.length / ITEMS_PER_PAGE);
  const currentDrafts = savedDrafts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const renderMicButton = (field: keyof FIRFormData) => (
    <button
      onClick={() => startListening(field)}
      className={`absolute right-3 top-9 p-1.5 rounded-full transition-all ${
        listeningField === field 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
      title={t.listening}
    >
      {listeningField === field ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );

  if (showHistory) {
    return (
        <div className="flex flex-col h-full bg-darkbg">
            <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setShowHistory(false)} className="text-slate-300 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-white">{t.historyTitle}</h2>
                </div>
                 <button 
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
                >
                    <Globe size={14} />
                    <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center mt-20 space-y-3">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Loading drafts...' : 'ड्राफ्ट लोड हो रहे हैं...'}</p>
                    </div>
                ) : savedDrafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500 space-y-2">
                        <FileText size={48} className="opacity-20" />
                        <p>{t.noDrafts}</p>
                        <button 
                            onClick={() => setShowHistory(false)} 
                            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                            {t.createFirst}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 min-h-[400px]">
                            {currentDrafts.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleLoadDraft(item)}
                                    className="bg-cardbg p-4 rounded-xl border border-slate-700 flex justify-between items-center hover:bg-slate-800 cursor-pointer group transition-colors shadow-sm"
                                >
                                    <div className="overflow-hidden mr-3 flex-1">
                                        <h4 className="text-white font-medium truncate">{item.name || `FIR: ${item.formData.complainant}`}</h4>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">{new Date(item.timestamp).toLocaleDateString()}</span>
                                            <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button onClick={(e) => handleEditDraftFromHistory(e, item)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"> <Edit size={18} /> </button>
                                        <button onClick={(e) => handleDownloadPDF(item.content, item.formData.complainant, e)} className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg"> <Download size={18} /> </button>
                                        <button onClick={(e) => handleShareHistoryItem(e, item)} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg"> <Share2 size={18} /> </button>
                                        <button onClick={(e) => handleDeleteDraft(item.id, e)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"> <Trash2 size={18} /> </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                                <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"> <ChevronLeft size={20} /> </button>
                                <span className="text-sm text-slate-400 font-medium">{language === 'en' ? `Page ${currentPage} of ${totalPages}` : `पेज ${currentPage} / ${totalPages}`}</span>
                                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"> <ChevronRight size={20} /> </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-darkbg">
      <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <button onClick={onBack} className="text-slate-300 hover:text-white">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-white">{t.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
            >
                <Globe size={14} />
                <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
            <button 
                onClick={() => setShowHistory(true)}
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                title="View History"
            >
                <HistoryIcon size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!draft ? (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-xs text-slate-400 mb-1">
                {t.complainant} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className={`w-full bg-slate-800 border rounded-lg p-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors ${errors.complainant ? 'border-red-500/50' : 'border-slate-700'}`}
                value={formData.complainant}
                onChange={e => handleChange('complainant', e.target.value)}
                placeholder={t.phComplainant}
              />
              {renderMicButton('complainant')}
              {errors.complainant && (
                <div className="flex items-center mt-1 text-red-400 text-xs">
                    <AlertCircle size={12} className="mr-1" /> {errors.complainant}
                </div>
              )}
            </div>
             <div className="relative">
              <label className="block text-xs text-slate-400 mb-1">{t.accused}</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-12 text-white focus:border-blue-500 focus:outline-none"
                value={formData.accused}
                onChange={e => handleChange('accused', e.target.value)}
                placeholder={t.phAccused}
              />
              {renderMicButton('accused')}
            </div>
             <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t.dateTime} <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${errors.dateTime ? 'border-red-500/50' : 'border-slate-700'}`}
                value={formData.dateTime}
                onChange={e => handleChange('dateTime', e.target.value)}
              />
              {errors.dateTime && (
                <div className="flex items-center mt-1 text-red-400 text-xs">
                    <AlertCircle size={12} className="mr-1" /> {errors.dateTime}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t.incidentType} <span className="text-red-400">*</span>
              </label>
              <select
                className={`w-full bg-slate-800 border rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors ${errors.incidentType ? 'border-red-500/50' : 'border-slate-700'}`}
                value={formData.incidentType}
                onChange={e => handleChange('incidentType', e.target.value)}
              >
                <option value="">{t.selectType}</option>
                {Object.keys(incidentTypesMap).map(typeKey => (
                  <option key={typeKey} value={typeKey}>
                    {language === 'en' ? incidentTypesMap[typeKey].en : incidentTypesMap[typeKey].hi}
                  </option>
                ))}
              </select>
              {errors.incidentType && (
                <div className="flex items-center mt-1 text-red-400 text-xs">
                    <AlertCircle size={12} className="mr-1" /> {errors.incidentType}
                </div>
              )}
            </div>

             <div className="relative">
              <label className="block text-xs text-slate-400 mb-1">
                {t.details} <span className="text-red-400">*</span>
              </label>
              <textarea
                className={`w-full bg-slate-800 border rounded-lg p-3 pr-12 text-white h-32 focus:outline-none focus:border-blue-500 transition-colors ${errors.incidentDetails ? 'border-red-500/50' : 'border-slate-700'}`}
                value={formData.incidentDetails}
                onChange={e => handleChange('incidentDetails', e.target.value)}
                placeholder={t.phDetails}
              />
               {renderMicButton('incidentDetails')}
               {errors.incidentDetails && (
                <div className="flex items-center mt-1 text-red-400 text-xs">
                    <AlertCircle size={12} className="mr-1" /> {errors.incidentDetails}
                </div>
              )}
            </div>
             <div className="relative">
              <label className="block text-xs text-slate-400 mb-1">{t.evidence}</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-12 text-white focus:border-blue-500 focus:outline-none"
                placeholder={t.phEvidence}
                value={formData.evidence}
                onChange={e => handleChange('evidence', e.target.value)}
              />
              {renderMicButton('evidence')}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex justify-center items-center space-x-2 shadow-lg shadow-red-900/20 mb-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              <span>{loading ? t.generating : t.generateBtn}</span>
            </button>

            <button
                onClick={() => setShowHistory(true)}
                className="w-full bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 hover:text-white transition-colors flex justify-center items-center space-x-2 border border-slate-700"
            >
                <HistoryIcon size={18} />
                <span>{t.viewHistory}</span>
            </button>
          </div>
        ) : (
          <div className="bg-cardbg rounded-xl border border-slate-700 flex flex-col max-h-full shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-red-400"/> {t.generatedTitle}
                </h3>
                <div className="flex space-x-2">
                    <button onClick={handleSaveDraft} className="text-green-400 hover:text-green-300 bg-green-900/20 hover:bg-green-900/40 p-1.5 rounded-lg transition-colors"> <Save size={18} /> </button>
                    <button onClick={(e) => handleDownloadPDF(draft, formData.complainant, e)} className="text-yellow-400 hover:text-yellow-300 bg-yellow-900/20 hover:bg-yellow-900/40 p-1.5 rounded-lg transition-colors"> <Download size={18} /> </button>
                    <button onClick={handleShare} className="text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-900/40 p-1.5 rounded-lg transition-colors"> <Share2 size={18} /> </button>
                    <button onClick={handleCopy} className="text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 p-1.5 rounded-lg transition-colors"> <Copy size={18} /> </button>
                </div>
            </div>
            <div className="p-4 overflow-y-auto whitespace-pre-wrap text-slate-300 text-sm font-mono leading-relaxed">
                {draft}
            </div>
            <div className="p-4 border-t border-slate-700 grid grid-cols-2 gap-3 bg-slate-800/30 rounded-b-xl">
                <button 
                    onClick={handleEditCurrent} 
                    className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <Edit size={16} />
                    <span>{t.edit}</span>
                </button>
                <button 
                    onClick={handleStartNew} 
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    <span>{t.new}</span>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRGenerator;
