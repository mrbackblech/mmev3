import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Komponente für robuste Fehlerbehandlung
 * Fängt React-Fehler ab und zeigt eine benutzerfreundliche Fehlerseite
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logge Fehler für Debugging (in Production könnte dies an einen Error-Tracking-Service gesendet werden)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom Fallback UI wenn vorhanden
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard Fallback UI
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8 flex justify-center">
              <AlertCircle className="w-24 h-24 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Entschuldigung, es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns, wenn das Problem weiterhin besteht.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gold-500 text-slate-900 rounded-lg hover:bg-gold-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 font-medium"
              >
                Seite neu laden
              </button>
              <a
                href="#contact"
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900 font-medium border border-slate-700"
              >
                Kontakt aufnehmen
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-slate-800 p-4 rounded-lg border border-slate-700">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 mb-2">
                  Fehlerdetails (nur in Entwicklung)
                </summary>
                <pre className="text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

