import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/1920/1080?grayscale&blur=2"
          alt="Event Background"
          className="w-full h-full object-cover opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/20 to-slate-900"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6 animate-[fadeIn_1s_ease-out]">
          <span className="inline-block py-1 px-3 border border-gold-500/50 rounded-full text-gold-500 text-xs tracking-[0.2em] uppercase mb-4">
            Premium Event Planning
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
          MM <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200">EVENT</span>
        </h1>
        
        <p className="text-[0.65rem] sm:text-sm md:text-2xl text-slate-300 font-light tracking-[0.15em] uppercase mb-12 border-t border-b border-slate-700 py-4 inline-block whitespace-nowrap overflow-hidden">
          Kunst <span className="text-gold-500 mx-1 md:mx-2">•</span> Kulinarik <span className="text-gold-500 mx-1 md:mx-2">•</span> Kultur
        </p>

        <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Wir erschaffen unvergessliche Momente durch die perfekte Symbiose aus künstlerischer Ästhetik,
          kulinarischen Höhepunkten und kultureller Tiefe.
        </p>

        <button 
          onClick={handleScrollToContact}
          className="inline-block bg-gold-600 hover:bg-gold-500 text-white font-bold py-4 px-10 rounded-sm transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] uppercase tracking-widest text-sm"
        >
          Event Planen
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-500">
        <ArrowDown size={24} />
      </div>
    </div>
  );
};