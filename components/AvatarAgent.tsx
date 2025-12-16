import React from 'react';

interface AvatarAgentProps {
  isSpeaking: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarAgent: React.FC<AvatarAgentProps> = ({ isSpeaking, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl';

  return (
    <div className={`relative ${sizeClass} flex items-center justify-center flex-shrink-0 transition-transform`}>
       {/* Glow Effect */}
       <div className={`absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 transition-opacity duration-300 ${isSpeaking ? 'animate-pulse opacity-80' : ''}`}></div>
       
       {/* Avatar Circle */}
       <div className="relative z-10 w-[90%] h-[90%] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
         <span className={`${iconSize} select-none transform transition-transform ${isSpeaking ? 'scale-110' : ''}`}>🤖</span>
         
         {/* Simple Shine Effect */}
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
       </div>

       {/* Speaking Sound Waves */}
       {isSpeaking && (
         <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 flex flex-col space-y-0.5 items-center">
             <span className="w-1 h-2 bg-blue-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]"></span>
             <span className="w-1 h-4 bg-blue-300 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.1s]"></span>
             <span className="w-1 h-2 bg-blue-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s]"></span>
         </div>
       )}
    </div>
  );
};

export default AvatarAgent;