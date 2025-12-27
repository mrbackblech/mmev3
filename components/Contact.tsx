import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { erpnextService } from '../services/erpnextService';

/**
 * Props für die Contact-Komponente
 */
interface ContactProps {
  /** Optionale Initialnachricht für das Formular */
  initialMessage?: string;
}

/**
 * Status des Kontaktformulars
 */
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Event-Typ Optionen für das Dropdown
 */
const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'Bitte wählen...' },
  { value: 'Hochzeit', label: 'Hochzeit' },
  { value: 'Firmenevent', label: 'Firmenevent' },
  { value: 'Geburtstag', label: 'Geburtstag' },
  { value: 'Jubiläum', label: 'Jubiläum' },
  { value: 'Gala-Dinner', label: 'Gala-Dinner' },
  { value: 'Konferenz', label: 'Konferenz' },
  { value: 'Sonstiges', label: 'Sonstiges' },
] as const;


/**
 * Kontakt-Komponente mit erweitertem Formular für Event-Anfragen
 *
 * Features:
 * - Erweiterte Felder für Event-Planung
 * - Clientseitige Validierung
 * - Status-Management mit visuellen Feedback
 * - Integration mit ERPNext für Lead-Erstellung
 */
export const Contact: React.FC<ContactProps> = ({ initialMessage = '' }) => {
  // Formular State
  const [message, setMessage] = useState(initialMessage); // Die Nachricht/Vision des Kunden
  const [customerName, setCustomerName] = useState(''); // Vollständiger Name des Kunden
  const [email, setEmail] = useState(''); // E-Mail-Adresse
  const [phone, setPhone] = useState(''); // Telefonnummer (optional)

  // Optionale Event-Details
  const [eventType, setEventType] = useState(''); // Art der Veranstaltung
  const [guestCount, setGuestCount] = useState(''); // Anzahl der Gäste
  const [newsletter, setNewsletter] = useState(false); // Newsletter-Anmeldung

  // UI State
  const [status, setStatus] = useState<FormStatus>('idle'); // Formular-Status
  const [errorMessage, setErrorMessage] = useState(''); // Fehlermeldung

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  /**
   * Validiert das Formular vor dem Absenden
   * @returns Fehler-Nachricht oder null wenn valide
   */
  const validateForm = (): string | null => {
    if (!customerName.trim()) return "Bitte geben Sie Ihren Namen ein.";
    if (!email.trim()) return "Bitte geben Sie Ihre E-Mail-Adresse ein.";
    if (!email.includes('@')) return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    if (!message.trim()) return "Bitte beschreiben Sie Ihre Vision.";
    return null;
  };

  /**
   * Behandelt das Absenden des Kontaktformulars
   * Validiert, sendet Daten an ERPNext und zeigt Feedback
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Lead-Daten für ERPNext zusammenstellen
      const nameParts = customerName.trim().split(/\s+/);
      const leadData: {
        first_name: string;
        last_name: string;
        email_id: string;
        source: string;
        mobile_no?: string;
        custom_message: string;
      } = {
        first_name: nameParts[0] || 'Kontakt',
        last_name: nameParts.slice(1).join(' ') || 'Anfrage',
        email_id: email.trim(),
        source: "Webseite",
        custom_message: "" // Wird später gesetzt
      };

      // Optionale Felder hinzufügen
      if (phone && phone.trim()) {
        leadData.mobile_no = phone.trim();
      }

      // Nachricht mit Event-Details zusammenstellen
      let fullMessage = message.trim();

      console.log('Ursprüngliche Nachricht:', message);
      console.log('Getrimmte Nachricht:', fullMessage);

      // Event-spezifische Informationen hinzufügen
      if (eventType) fullMessage += `\n\nEvent-Typ: ${eventType}`;
      if (guestCount) fullMessage += `\n\nGästezahl: ${guestCount}`;
      if (newsletter) fullMessage += `\n\nNewsletter-Anmeldung: Ja`;

      console.log('Vollständige Nachricht:', fullMessage);

      // Nachricht in ERPNext Lead speichern
      leadData.custom_message = fullMessage;

      console.log('Lead Data für ERPNext:', leadData);

      // Lead in ERPNext erstellen
      await erpnextService.createLead(leadData);

      setStatus('success');

      // Formular zurücksetzen nach erfolgreichem Versand
      setCustomerName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setEventType('');
      setGuestCount('');
      setNewsletter(false);

    } catch (error) {
      console.error("Fehler bei Lead-Erstellung:", error);
      setErrorMessage("Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per E-Mail an info@mm-event.live");
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="w-full">
        <span className="text-gold-500 text-[8px] uppercase tracking-[0.5em] font-bold mb-6 block">KONTAKT</span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-16 lg:mb-24 max-w-2xl">
          Starten wir den <br />
          <span className="italic text-gold-500">Dialog.</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-y-16">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">NAME *</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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

              <div className="space-y-2">
                <label htmlFor="eventType" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">EVENT-TYP</label>
                <select
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all font-serif text-base"
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

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
                <label htmlFor="message" className="block text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">ERZÄHLEN SIE UNS VON IHRER VISION *</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={message}
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
                disabled={status === 'success'}
                className="flex items-center justify-center gap-2 text-white uppercase tracking-[0.3em] lg:tracking-[0.4em] text-[11px] lg:text-[10px] font-bold group pt-4 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded w-full lg:w-auto px-6 py-3"
                aria-label={status === 'loading' ? "Nachricht wird gesendet" : "Kontaktformular absenden"}
              >
                {status === 'loading' ? (
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