import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AGB } from './AGB';
import { Impressum } from './Impressum';
import { Datenschutz } from './Datenschutz';

export type LegalModalType = 'agb' | 'impressum' | 'datenschutz' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (type) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [type, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!type) return null;

  const getTitle = () => {
    switch (type) {
      case 'agb': return 'Allgemeine Geschäftsbedingungen';
      case 'impressum': return 'Impressum';
      case 'datenschutz': return 'Datenschutzerklärung';
      default: return '';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'agb': return <AGB />;
      case 'impressum': return <Impressum />;
      case 'datenschutz': return <Datenschutz />;
      default: return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-gold-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gold-500 bg-slate-800">
          <h2 className="text-2xl font-serif font-bold text-gold-500">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
            aria-label="Modal schließen"
          >
            <X className="w-6 h-6 text-slate-300 hover:text-gold-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800">
          {getContent()}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gold-500 p-6 flex justify-end bg-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gold-500 text-slate-900 rounded-lg hover:bg-gold-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
