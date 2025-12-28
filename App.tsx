import React, { useState, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy Loading für große Komponenten
const Gallery = lazy(() => import('./components/Gallery').then(module => ({ default: module.Gallery })));
const Contact = lazy(() => import('./components/Contact').then(module => ({ default: module.Contact })));
const LegalModal = lazy(() => import('./components/LegalModal').then(module => ({ default: module.LegalModal })));

import type { LegalModalType } from './components/LegalModal';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [contactMessage, setContactMessage] = useState('');
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  const handleInquire = (projectTitle: string) => {
    setContactMessage(`Ich interessiere mich für das Projekt "${projectTitle}" und würde gerne mehr erfahren.`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-gold-500 selection:text-white">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold-500 focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded focus:font-bold focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          Zum Hauptinhalt springen
        </a>
        <Navbar activeSection={activeSection} />
        
        <main id="main-content">
          <section id="home">
            <Hero />
          </section>

          <section id="gallery" className="bg-slate-900 md:pb-20 pb-0 pt-0">
            <Suspense fallback={
              <div className="w-full py-20 bg-slate-900 border-t border-slate-800 text-center text-slate-400 font-serif tracking-widest uppercase text-sm">
                Lädt Portfolio...
              </div>
            }>
              <ErrorBoundary>
                <Gallery onInquire={handleInquire} />
              </ErrorBoundary>
            </Suspense>
          </section>

          <section id="contact" className="bg-slate-900 md:pt-20 pt-0 pb-20">
            <Suspense fallback={
              <div className="container mx-auto px-6 py-12 lg:py-20">
                <div className="w-full">
                  <span className="text-gold-500 text-[8px] uppercase tracking-[0.5em] font-bold mb-6 block">KONTAKT</span>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-16 lg:mb-24 max-w-2xl">
                    Starten wir den <br />
                    <span className="italic text-gold-500">Dialog.</span>
                  </h2>
                  <div className="text-slate-400 text-center py-12">Lädt Kontaktformular...</div>
                </div>
              </div>
            }>
              <ErrorBoundary>
                <Contact initialMessage={contactMessage} />
              </ErrorBoundary>
            </Suspense>
          </section>
        </main>

        <Footer onLegalClick={setLegalModal} />

        <Suspense fallback={null}>
          <LegalModal
            type={legalModal}
            onClose={() => setLegalModal(null)}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}