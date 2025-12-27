import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { erpnextService } from '../services/erpnextService';

interface ContactProps {
  initialMessage?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export const Contact: React.FC<ContactProps> = ({ initialMessage = '' }) => {
  const [custom_message, setMessage] = useState(initialMessage);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [budget, setBudget] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const validateForm = () => {
    if (!name.trim()) return "Bitte geben Sie Ihren Namen ein.";
    if (!email.trim()) return "Bitte geben Sie Ihre E-Mail-Adresse ein.";
    if (!email.includes('@')) return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    if (!custom_message.trim()) return "Bitte beschreiben Sie Ihre Vision.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('loading');
    setErrorMessage('');

    try {
      // Lead-Daten zusammenstellen
      const nameParts = name.trim().split(/\s+/);
      const leadData = {
        first_name: nameParts[0] || 'Kontakt',
        last_name: nameParts.slice(1).join(' ') || 'Anfrage',
        email_id: email.trim(),
        source: "Webseite"
      };

      // Optionale Felder hinzufügen
      if (phone && phone.trim()) {
        leadData.mobile_no = phone.trim();
      }

      // Erweiterte Nachricht mit allen Details zusammenstellen
      let fullMessage = custom_message.trim();
      if (eventType) fullMessage += `\n\nEvent-Typ: ${eventType}`;
      if (budget) fullMessage += `\n\nBudget: ${budget}`;
      if (preferredDate) fullMessage += `\n\nGewünschter Termin: ${preferredDate}`;
      if (guestCount) fullMessage += `\n\nGästezahl: ${guestCount}`;
      if (newsletter) fullMessage += `\n\nNewsletter-Anmeldung: Ja`;

      // Beide message Felder hinzufügen (beide sind in ERPNext erforderlich)
      leadData.custom_message = fullMessage;
      leadData.custom_custom_message = fullMessage;

      console.log('Lead Data:', leadData);

      await erpnextService.createLead(leadData);

      setStatus('success');
      // Formular zurücksetzen
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setEventType('');
      setBudget('');
      setPreferredDate('');
      setGuestCount('');
      setNewsletter(false);
      setEventType('');
      setBudget('');
      setPreferredDate('');
      setGuestCount('');
      setNewsletter(false);

    } catch (error) {
      console.error("Error creating lead:", error);
      setErrorMessage("Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per E-Mail an info@mm-event.live");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="w-full">
        <span className="text-gold-500 text-[8px] uppercase tracking-[0.5em] font-bold mb-6 block" aria-label="Kontaktbereich">KONTAKT</span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-16 lg:mb-24 max-w-2xl">
          Starten wir den <br />
          <span className="italic text-gold-500">Dialog.</span>
        </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-y-12 lg:gap-y-16">
              <div className="lg:col-span-6">
                {/* Status Messages */}
                {status === 'success' && (
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <p className="text-green-400 text-sm">Vielen Dank für Ihre Nachricht! Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                    <XCircle className="text-red-500 flex-shrink-0" size={20} />
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <form className="space-y-6 lg:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">NAME *</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr vollständiger Name"
                  autoComplete="name"
                  className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base placeholder-slate-600"
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">E-MAIL ADRESSE *</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.com"
                  autoComplete="email"
                  className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base placeholder-slate-600"
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">TELEFON</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456 789"
                  autoComplete="tel"
                  className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="eventType" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">EVENT-TYP</label>
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base"
                  >
                    <option value="" className="bg-slate-900">Bitte wählen...</option>
                    <option value="Hochzeit" className="bg-slate-900">Hochzeit</option>
                    <option value="Firmenevent" className="bg-slate-900">Firmenevent</option>
                    <option value="Geburtstag" className="bg-slate-900">Geburtstag</option>
                    <option value="Jubiläum" className="bg-slate-900">Jubiläum</option>
                    <option value="Gala-Dinner" className="bg-slate-900">Gala-Dinner</option>
                    <option value="Konferenz" className="bg-slate-900">Konferenz</option>
                    <option value="Sonstiges" className="bg-slate-900">Sonstiges</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="budget" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">BUDGET</label>
                  <select
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base"
                  >
                    <option value="" className="bg-slate-900">Bitte wählen...</option>
                    <option value="Bis 5.000€" className="bg-slate-900">Bis 5.000€</option>
                    <option value="5.000€ - 15.000€" className="bg-slate-900">5.000€ - 15.000€</option>
                    <option value="15.000€ - 30.000€" className="bg-slate-900">15.000€ - 30.000€</option>
                    <option value="Über 30.000€" className="bg-slate-900">Über 30.000€</option>
                    <option value="Auf Anfrage" className="bg-slate-900">Auf Anfrage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="guestCount" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">GÄSTEZAHL</label>
                  <input
                    type="number"
                    id="guestCount"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="z.B. 50"
                    min="1"
                    className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base placeholder-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferredDate" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">GEWÜNSCHTER TERMIN</label>
                  <input
                    type="date"
                    id="preferredDate"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">ERZÄHLEN SIE UNS VON IHRER VISION</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={custom_message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beschreiben Sie Ihre Veranstaltungsidee, Wünsche und Vorstellungen..."
                  className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all resize-none font-serif text-base placeholder-slate-600"
                  aria-required="true"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-transparent border-slate-600 rounded focus:ring-gold-500 focus:ring-2"
                />
                <label htmlFor="newsletter" className="text-sm text-slate-400 font-serif">
                  Ja, ich möchte den Newsletter abonnieren und über aktuelle Angebote informiert werden.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || status === 'success'}
                className="flex items-center justify-center gap-2 text-white uppercase tracking-[0.3em] lg:tracking-[0.4em] text-[11px] lg:text-[10px] font-bold group pt-4 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded w-full lg:w-auto px-6 py-3"
                aria-label={loading ? "Nachricht wird gesendet" : "Kontaktformular absenden"}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-gold-500" />
                    <span>SENDET...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span>GESENDET</span>
                  </>
                ) : (
                  <>
                    <span>ABSENDEN</span>
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-gold-500" />
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="hidden lg:block lg:col-span-2"></div>
          <div className="col-span-1 lg:col-span-4 lg:border-l lg:border-slate-800 lg:pl-12 flex flex-col justify-start space-y-8 lg:space-y-12 mt-12 lg:mt-0">
            <div className="space-y-4">
               <span className="text-slate-500 text-[8px] uppercase tracking-[0.3em] font-bold block">KONTAKT</span>
               <div className="space-y-1">
                 <a href="mailto:hello@mmevent.com" className="text-xl md:text-2xl font-serif text-white hover:text-gold-500 transition-colors block leading-tight">hello@mmevent.com</a>
                 <a href="tel:+490123456789" className="text-base md:text-lg font-serif text-slate-400 hover:text-white transition-colors block">+49 (0) 123 456 789</a>
               </div>
            </div>
            <div className="space-y-4">
               <span className="text-slate-500 text-[8px] uppercase tracking-[0.3em] font-bold block">STUDIO</span>
               <p className="text-lg md:text-xl font-serif text-slate-300 leading-snug">Königsallee 1<br />40212 Düsseldorf<br />Deutschland</p>
            </div>
            <div className="space-y-4 opacity-40">
               <span className="text-slate-500 text-[8px] uppercase tracking-[0.3em] font-bold block">FAX & FESTNETZ</span>
               <p className="text-xs font-serif text-slate-400 leading-relaxed">Festnetz: +49 (0) 211 987 654 0<br />Fax: +49 (0) 211 987 654 9</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};