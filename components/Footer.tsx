import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 py-10 border-t border-slate-800">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-xl font-serif font-bold text-white mb-4">
          MM<span className="text-gold-500">EVENT</span>
        </h2>
        <nav className="flex justify-center space-x-6 mb-8 text-sm text-slate-300 uppercase tracking-wider" aria-label="Fußzeilen-Navigation">
          <a href="#home" className="hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors">Home</a>
          <a href="#gallery" className="hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors">Projekte</a>
          <a href="#contact" className="hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors">Impressum</a>
          <a href="#contact" className="hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors">Datenschutz</a>
        </nav>
        <p className="text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} MM EVENT. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
};