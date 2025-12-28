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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gold-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gold-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold-300 bg-gold-200">
          <h2 className="text-2xl font-serif font-bold text-slate-800">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gold-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Modal schließen"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {getContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gold-300 p-6 flex justify-end bg-gold-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
