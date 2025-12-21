import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 py-10 border-t border-slate-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-xl font-serif font-bold text-white mb-4">
          MM<span className="text-gold-500">EVENT</span>
        </h2>
        <div className="flex justify-center space-x-6 mb-8 text-sm text-slate-400 uppercase tracking-wider">
          <a href="#home" className="hover:text-gold-500 transition-colors">Home</a>
          <a href="#gallery" className="hover:text-gold-500 transition-colors">Projekte</a>
          <a href="#contact" className="hover:text-gold-500 transition-colors">Impressum</a>
          <a href="#contact" className="hover:text-gold-500 transition-colors">Datenschutz</a>
        </div>
        <p className="text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} MM EVENT. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
};