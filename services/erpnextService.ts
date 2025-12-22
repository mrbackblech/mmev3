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
    // #region agent log
    const requestBody = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;
    fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:21',message:'Request before fetch',data:{url,method:options.method,body:requestBody},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion
    
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
      // #region agent log
      const responseStatus = response.status;
      const responseHeaders = Object.fromEntries(response.headers.entries());
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:38',message:'Response received',data:{status:responseStatus,headers:responseHeaders,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorText = await response.text();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:42',message:'Response error text',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        throw new Error(
          `ERPnext API Error (${response.status}): ${errorText || response.statusText}`
        );
      }

      const jsonResponse = await response.json();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:50',message:'Response JSON parsed',data:{jsonResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      return jsonResponse;
    } catch (error) {
      // #region agent log
      const errorData = error instanceof Error ? {message:error.message,stack:error.stack} : {error:String(error)};
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:53',message:'Request catch error',data:errorData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
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
      // Hinweis: 'image' Feld ist nicht in der Liste, da ERPnext es nicht in der API-Abfrage erlaubt
      // Für Bilder muss ein separater API-Call für einzelne Projekte gemacht werden
      const defaultFields = ['name', 'project_name', 'expected_end_date', 'status', 'notes'];
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
        const imageUrl = project?.image ? this.getImageUrl(project.image) : null;
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
   * Erstellt einen neuen Lead in ERPnext
   * @param leadData Die Lead-Daten
   * @returns Die erstellte Lead-Response
   */
  async createLead(leadData: ERPnextLead): Promise<ERPnextCreateResponse> {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:133',message:'createLead entry',data:{leadData,sourceValue:leadData.source},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      const endpoint = '/api/resource/Lead';
      const requestBody = JSON.stringify(leadData);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:137',message:'Request body before send',data:{endpoint,requestBody},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
      const response = await this.request<ERPnextCreateResponse>(endpoint, {
        method: 'POST',
        body: requestBody,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:143',message:'createLead success',data:{response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion

      return response;
    } catch (error) {
      // #region agent log
      const errorData = error instanceof Error ? {message:error.message,stack:error.stack} : {error:String(error)};
      fetch('http://127.0.0.1:7242/ingest/ee4aaa02-a2f5-467f-aea6-17dcce255ef4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'erpnextService.ts:149',message:'createLead error',data:errorData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
      // #endregion
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
