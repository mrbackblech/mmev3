import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [contactMessage, setContactMessage] = useState('');

  const handleInquire = (projectTitle: string) => {
    setContactMessage(`Ich interessiere mich für das Projekt "${projectTitle}" und würde gerne mehr erfahren.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-gold-500 selection:text-white">
      <Navbar activeSection={activeSection} />
      
      <main>
        <section id="home">
          <Hero />
        </section>

        <section id="gallery" className="bg-slate-900 md:pb-20 pb-0 pt-0">
          <Gallery onInquire={handleInquire} />
        </section>

        <section id="contact" className="bg-slate-900 md:pt-20 pt-0 pb-20">
          <Contact initialMessage={contactMessage} />
        </section>
      </main>

      <Footer />
    </div>
  );
}