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
    
    const defaultHeaders: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ERPnext API Error (${response.status}): ${errorText || response.statusText}`
        );
      }

      return await response.json();
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
      const defaultFields = ['name', 'project_name', 'expected_end_date', 'status', 'notes', 'image'];
      const fieldsToFetch = fields || defaultFields;
      const fieldsParam = JSON.stringify(fieldsToFetch);
      
      const endpoint = `/api/resource/Project?fields=${encodeURIComponent(fieldsParam)}`;
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
   * Erstellt einen neuen Lead in ERPnext
   * @param leadData Die Lead-Daten
   * @returns Die erstellte Lead-Response
   */
  async createLead(leadData: ERPnextLead): Promise<ERPnextCreateResponse> {
    try {
      const endpoint = '/api/resource/Lead';
      const response = await this.request<ERPnextCreateResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(leadData),
      });

      return response;
    } catch (error) {
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
