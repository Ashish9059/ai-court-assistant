import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CommonViewProps, View, AgentAction } from '../types';
import { chatWithAgent } from '../services/gemini';
import { Send, AlertCircle, Globe, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AvatarAgent from '../components/AvatarAgent';

const Chat: React.FC<CommonViewProps> = ({ language, toggleLanguage, setView }) => {
  const t = {
      welcome: language === 'en' 
        ? 'Namaste! I am Nyaya Sahayak. Ask me any question related to Indian Law.'
        : 'नमस्ते! मैं न्याय सहायक हूँ। मुझसे भारतीय कानून से संबंधित कोई भी प्रश्न पूछें।',
      placeholder: language === 'en' ? 'Ask about Indian Law...' : 'भारतीय कानून के बारे में पूछें...',
      disclaimer: language === 'en' 
        ? 'AI can make mistakes. Not a substitute for professional legal counsel.'
        : 'AI गलतियाँ कर सकता है। पेशेवर कानूनी सलाह का विकल्प नहीं है।',
      loading: language === 'en' ? 'Thinking...' : 'सोच रहा हूँ...',
      title: language === 'en' ? 'Legal Chat' : 'कानूनी चैट',
      actionBtn: (action: string) => language === 'en' ? `Open ${action}` : `${action} खोलें`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{ id: '1', role: 'model', text: t.welcome }]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle TTS speaking state monitoring
  useEffect(() => {
    const interval = setInterval(() => {
        setIsSpeaking(synth.speaking);
    }, 100);
    return () => clearInterval(interval);
  }, [synth]);

  const speak = (text: string) => {
      if (!isVoiceOn) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Set language for better pronunciation
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAgent(input, language);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response_text,
        action: response.action !== 'generalAnswer' ? response.action : undefined,
      };
      
      setMessages((prev) => [...prev, botMsg]);
      
      // Speak the response
      speak(response.response_text);
      
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: AgentAction) => {
    if (!setView) return;
    
    switch (action) {
        case 'generateFIR': setView(View.FIR_GENERATOR); break;
        case 'generateNotice': setView(View.NOTICE_GENERATOR); break;
        case 'summarizeCase': setView(View.CASE_SUMMARY); break;
        case 'analyzeDocument': setView(View.DOCUMENT_ANALYZER); break;
        case 'offenceChecker': setView(View.LAW_FINDER); break;
        case 'timelineInfo': setView(View.TIMELINE); break;
        case 'rightsInfo': setView(View.RIGHTS); break;
        case 'dictionaryLookup': setView(View.DICTIONARY); break;
        default: break;
    }
  };

  const getActionLabel = (action: AgentAction) => {
      switch(action) {
          case 'generateFIR': return language === 'en' ? 'Go to FIR Generator' : 'FIR जनरेटर पर जाएं';
          case 'generateNotice': return language === 'en' ? 'Go to Notice Generator' : 'नोटिस जनरेटर पर जाएं';
          case 'summarizeCase': return language === 'en' ? 'Go to Case Summary' : 'केस सारांश पर जाएं';
          case 'analyzeDocument': return language === 'en' ? 'Go to Document Analyzer' : 'दस्तावेज़ विश्लेषक पर जाएं';
          case 'offenceChecker': return language === 'en' ? 'Go to Law Finder' : 'कानून खोजक पर जाएं';
          case 'timelineInfo': return language === 'en' ? 'View Timeline' : 'समयरेखा देखें';
          case 'rightsInfo': return language === 'en' ? 'Read Rights' : 'अधिकार पढ़ें';
          case 'dictionaryLookup': return language === 'en' ? 'Open Dictionary' : 'शब्दकोश खोलें';
          default: return language === 'en' ? 'Open Tool' : 'टूल खोलें';
      }
  }

  return (
    <div className="flex flex-col h-full bg-darkbg">
       <div className="p-3 bg-cardbg border-b border-slate-700 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center space-x-3">
             {/* Avatar in Header */}
             <AvatarAgent isSpeaking={isSpeaking} size="sm" />
             <h2 className="text-lg font-bold text-white">{t.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Voice Toggle Button */}
            <button 
                onClick={() => {
                    if(isVoiceOn) synth.cancel();
                    setIsVoiceOn(!isVoiceOn);
                }}
                className={`p-2 rounded-full transition-colors ${isVoiceOn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                title="Toggle Voice"
            >
                {isVoiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
            >
                <Globe size={14} />
                <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-200">{t.disclaimer}</p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start space-x-2'}`}
          >
            {/* Show Avatar next to model messages */}
            {msg.role === 'model' && (
                <div className="mt-1 hidden sm:block">
                     <AvatarAgent isSpeaking={isSpeaking && msg.id === messages[messages.length-1].id} size="sm" />
                </div>
            )}

            <div className="max-w-[85%] flex flex-col">
                <div
                className={`rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-cardbg text-slate-200 rounded-bl-none border border-slate-700'
                }`}
                >
                    {msg.role === 'model' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown 
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-base font-bold my-2 text-white" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-sm font-bold my-2 text-blue-300" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-sm font-bold my-1 text-blue-200" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 my-1" {...props} />,
                                    li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        msg.text
                    )}
                </div>
                {msg.role === 'model' && msg.action && (
                    <button
                        onClick={() => handleActionClick(msg.action!)}
                        className="mt-2 self-start flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/50 hover:bg-blue-500/30 transition-colors animate-fade-in"
                    >
                        <span>{getActionLabel(msg.action)}</span>
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-2">
            <AvatarAgent isSpeaking={true} size="sm" />
            <div className="bg-cardbg rounded-2xl p-3 rounded-bl-none border border-slate-700 flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs text-slate-500 ml-2">{t.loading}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-cardbg border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-darkbg border border-slate-600 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;