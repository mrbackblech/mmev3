import { CONFIG } from '../config';
import { ERPnextProject, ERPnextLead, ERPnextAPIResponse, ERPnextCreateResponse } from '../types';

/**
 * Zentrale Service-Klasse für ERPnext API-Interaktionen
 */
class ERPnextService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = CONFIG.API_URL;
  }

  /**
   * Führt einen generischen API-Request an ERPnext aus
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestBody = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;
    
    const defaultHeaders: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
        // Fix für 417 Expectation Failed: Verhindere automatische Expect-Header
        'Expect': '',
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Spezifische Fehlerbehandlung für verschiedene HTTP-Status-Codes
        let errorMessage: string;
        switch (response.status) {
          case 400:
            errorMessage = `Bad Request: Ungültige Parameter oder fehlerhafte Anfrage. ${errorText || response.statusText}`;
            break;
          case 401:
            errorMessage = `Unauthorized: Authentifizierungsfehler. ${errorText || response.statusText}`;
            break;
          case 403:
            errorMessage = `Forbidden: Keine Berechtigung für diese Ressource. ${errorText || response.statusText}`;
            break;
          case 404:
            errorMessage = `Not Found: Die angeforderte Ressource wurde nicht gefunden. ${errorText || response.statusText}`;
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = `Server Error: ERPNext Server-Fehler (${response.status}). ${errorText || response.statusText}`;
            break;
          default:
            errorMessage = `ERPnext API Error (${response.status}): ${errorText || response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`ERPnext Request Failed: ${error.message}`);
      }
      throw new Error('ERPnext Request Failed: Unknown error');
    }
  }

  /**
   * Ruft alle Projekte von ERPnext ab
   * @param fields Optionale Liste von Feldern, die abgerufen werden sollen
   * @returns Array von Projekten
   */
  async getProjects(fields?: string[]): Promise<ERPnextProject[]> {
    try {
      // Standard-Felder und Custom-Felder für Projekte
      // Hinweis: custom_image wird separat geladen falls nicht direkt verfügbar
      const defaultFields = [
        'name',
        'project_name',
        'expected_end_date',
        'status',
        'notes',
        'custom_location',
        'custom_highlights_text',
        'custom_description',
        'custom_image'
      ];
      const fieldsToFetch = fields || defaultFields;
      // ERPNext erwartet fields als JSON-Array im Query-String
      // Format: fields=["field1","field2"]
      const fieldsParam = JSON.stringify(fieldsToFetch);
      const params = new URLSearchParams();
      params.set('fields', fieldsParam);
      
      const endpoint = `/api/resource/Project?${params.toString()}`;
      const response = await this.request<ERPnextAPIResponse<ERPnextProject>>(endpoint, {
        method: 'GET',
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects from ERPnext:', error);
      throw error;
    }
  }

  /**
   * Ruft ein einzelnes Projekt anhand des Namens ab
   * @param projectName Der Name des Projekts
   * @returns Das Projekt oder null wenn nicht gefunden
   * Hinweis: Bei einzelnen Projekten werden alle Felder inkl. 'image' zurückgegeben
   */
  async getProject(projectName: string): Promise<ERPnextProject | null> {
    try {
      const endpoint = `/api/resource/Project/${encodeURIComponent(projectName)}`;
      const response = await this.request<{ data: ERPnextProject }>(endpoint, {
        method: 'GET',
      });

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching project ${projectName} from ERPnext:`, error);
      throw error;
    }
  }

  /**
   * Ruft Bilder für mehrere Projekte ab (nutzt getProject für jedes Projekt)
   * @param projectNames Array von Projekt-Namen
   * @returns Map von Projekt-Namen zu Bild-URLs
   */
  async getProjectImages(projectNames: string[]): Promise<Map<string, string | null>> {
    const imageMap = new Map<string, string | null>();
    
    // Parallel alle Projekte abrufen
    const promises = projectNames.map(async (name) => {
      try {
        const project = await this.getProject(name);
        const imageUrl = project?.custom_image ? this.getImageUrl(project.custom_image) : null;
        return { name, imageUrl };
      } catch (error) {
        console.warn(`Could not fetch image for project ${name}:`, error);
        return { name, imageUrl: null };
      }
    });

    const results = await Promise.all(promises);
    results.forEach(({ name, imageUrl }) => {
      imageMap.set(name, imageUrl);
    });

    return imageMap;
  }

  /**
   * Ruft verfügbare Lead Source-Werte von ERPnext ab
   * @returns Array von Source-Namen oder null wenn nicht verfügbar
   */
  async getLeadSources(): Promise<string[] | null> {
    try {
      // Versuche verschiedene mögliche Doctype-Namen für Lead Sources
      const possibleDoctypes = ['Lead Source', 'Source', 'LeadSource'];
      for (const doctype of possibleDoctypes) {
        try {
          // Konsistentes Format wie bei getProjects()
          const fieldsParam = JSON.stringify(['name']);
          const params = new URLSearchParams();
          params.set('fields', fieldsParam);
          const endpoint = `/api/resource/${encodeURIComponent(doctype)}?${params.toString()}`;
          const response = await this.request<ERPnextAPIResponse<{name: string}>>(endpoint, {
            method: 'GET',
          });
          return response.data?.map(d => d.name) || [];
        } catch (e) {
          continue;
        }
      }
      return null;
    } catch (error) {
      const errorData = error instanceof Error ? {message:error.message} : {error:String(error)};
      return null;
    }
  }

  /**
   * Erstellt einen neuen Lead in ERPnext
   * @param leadData Die Lead-Daten
   * @returns Die erstellte Lead-Response
   */
  async createLead(leadData: ERPnextLead): Promise<ERPnextCreateResponse> {
    try {
      
      // Prüfe, ob source-Wert existiert, wenn gesetzt
      let finalLeadData = { ...leadData };
      if (leadData.source) {
        const sources = await this.getLeadSources();
        if (sources && !sources.includes(leadData.source)) {
          // Source-Wert existiert nicht - entferne das Feld
          const { source, ...dataWithoutSource } = finalLeadData;
          finalLeadData = dataWithoutSource;
        }
      }
      
      const endpoint = '/api/resource/Lead';
      const requestBody = JSON.stringify(finalLeadData);
      const response = await this.request<ERPnextCreateResponse>(endpoint, {
        method: 'POST',
        body: requestBody,
      });

      return response;
    } catch (error) {
      const errorData = error instanceof Error ? {message:error.message,stack:error.stack} : {error:String(error)};
      console.error('Error creating lead in ERPnext:', error);
      throw error;
    }
  }

  /**
   * Ruft die vollständige URL für ein ERPnext-Bild ab
   * @param imagePath Der relative Pfad zum Bild (z.B. /files/image.jpg)
   * @returns Die vollständige URL zum Bild
   */
  getImageUrl(imagePath?: string): string | null {
    if (!imagePath) {
      return null;
    }
    
    // Wenn der Pfad bereits eine vollständige URL ist, zurückgeben
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Andernfalls die Base-URL voranstellen
    return `${this.baseUrl}${imagePath}`;
  }
}

// Singleton-Instanz exportieren
export const erpnextService = new ERPnextService();
