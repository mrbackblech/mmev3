/**
 * Repräsentiert ein Bild in der Galerie
 */
export interface GalleryImage {
  /** Eindeutige ID des Bildes */
  id: number;
  /** URL des Bildes */
  url: string;
  /** Titel/Beschreibung des Bildes */
  title: string;
  /** Kategorie des Events */
  category: string;
  /** Optionale detaillierte Beschreibung */
  description?: string;
  /** Veranstaltungsort */
  location?: string;
  /** Datum der Veranstaltung */
  date?: string;
  /** Wichtige Highlights der Veranstaltung */
  highlights?: string[];
  /** Zusätzliche Bilder */
  additionalImages?: string[];
}

/**
 * Navigationselement für die Website
 */
export interface NavItem {
  /** Anzeigetext des Navigationslinks */
  label: string;
  /** Ziel-URL des Links */
  href: string;
}

/**
 * Mögliche Ladezustände der Anwendung
 */
export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// ========================================
// ERPNext API Types
// ========================================

/**
 * Repräsentiert ein Projekt in ERPNext
 */
export interface ERPnextProject {
  /** Eindeutiger Projektname */
  name: string;
  /** Anzeigename des Projekts */
  project_name?: string;
  /** Erwartetes Enddatum */
  expected_end_date?: string;
  /** Aktueller Status des Projekts */
  status?: string;
  /** Projektnotizen/Beschreibung */
  notes?: string;
  /** Bild-URL für das Projekt */
  image?: string;
  /** Zusätzliche dynamische Felder */
  [key: string]: any;
}

/**
 * Repräsentiert einen Lead in ERPNext
 */
export interface ERPnextLead {
  /** Optionale Lead-ID */
  name?: string;
  /** Vorname des Leads */
  first_name?: string;
  /** Nachname des Leads */
  last_name?: string;
  /** Firmenname (für Organisations-Leads) */
  company_name?: string;
  /** Flag für Organisations-Leads (1 = Organisation, 0 = Person) */
  organization_lead?: number;
  /** E-Mail-Adresse (erforderlich) */
  email_id: string;
  /** Mobiltelefonnummer */
  mobile_no?: string;
  /** Benutzerdefinierte Nachricht/Vision des Kunden */
  custom_message?: string;
  /** Quelle des Leads (z.B. "Webseite") */
  source?: string;
  /** Besitzer des Leads */
  lead_owner?: string;
  /** Zusätzliche dynamische Felder */
  [key: string]: any;
}

export interface ERPnextAPIResponse<T> {
  data: T[];
  message?: string;
}

export interface ERPnextCreateResponse {
  data: {
    name: string;
    [key: string]: any;
  };
  message?: string;
}