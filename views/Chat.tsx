import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CommonViewProps } from '../types';
import { generateLegalResponse } from '../services/gemini';
import { Send, AlertCircle, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Chat: React.FC<CommonViewProps> = ({ language, toggleLanguage }) => {
  const t = {
      welcome: language === 'en' 
        ? 'Namaste! I am Nyaya Sahayak. Ask me any question related to Indian Law (IPC, CrPC, Property, Family Law, etc.).'
        : 'नमस्ते! मैं न्याय सहायक हूँ। मुझसे भारतीय कानून (IPC, CrPC, संपत्ति, परिवार कानून, आदि) से संबंधित कोई भी प्रश्न पूछें।',
      placeholder: language === 'en' ? 'Ask about Indian Law...' : 'भारतीय कानून के बारे में पूछें...',
      disclaimer: language === 'en' 
        ? 'AI can make mistakes. Information provided is for educational purposes and not a substitute for professional legal counsel.'
        : 'AI गलतियाँ कर सकता है। प्रदान की गई जानकारी शैक्षिक उद्देश्यों के लिए है और पेशेवर कानूनी सलाह का विकल्प नहीं है।',
      loading: language === 'en' ? 'Thinking...' : 'सोच रहा हूँ...',
      title: language === 'en' ? 'Legal Chat' : 'कानूनी चैट',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when language changes or on mount
  useEffect(() => {
    setMessages(prev => {
        if (prev.length === 0) {
            return [{ id: '1', role: 'model', text: t.welcome }];
        }
        // If the first message is the welcome message, update it to current language
        if (prev[0].id === '1' && prev.length === 1) {
             return [{ ...prev[0], text: t.welcome }];
        }
        return prev;
    });
  }, [language, t.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const responseText = await generateLegalResponse(input, language);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      // Handle error gracefully
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-darkbg">
       <div className="p-4 bg-cardbg border-b border-slate-700 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-lg font-bold text-white">{t.title}</h2>
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-600"
        >
            <Globe size={14} />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-200">{t.disclaimer}</p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm ${
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
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cardbg rounded-2xl p-3 rounded-bl-none border border-slate-700 flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
