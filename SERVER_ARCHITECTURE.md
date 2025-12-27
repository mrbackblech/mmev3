# Server-Architektur: MM EVENT Website

## Übersicht

Die MM EVENT Website folgt einer **modularen Microservices-Architektur** mit klarer Trennung von Frontend, API-Proxy und Backend-Systemen. Diese Dokumentation erklärt die komplette Serverstruktur und deren Zusammenspiel.

## 🏗️ Architektur-Übersicht

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │────│   Express Proxy  │────│   ERPNext       │
│   (Frontend)    │    │   (API Gateway)  │    │   (Backend)     │
│                 │    │                  │    │                 │
│ • Vite Build    │    │ • CORS Handling  │    │ • Project Data  │
│ • TypeScript    │    │ • Auth Forwarding│    │ • Lead Mgmt     │
│ • Tailwind CSS  │    │ • File Proxying  │    │ • File Storage   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                       │
        └───────────HTTPS─────────┴──────────HTTP─────────┘
```

## 📁 Projekt-Struktur

```
mmev3/
├── 📄 package.json          # NPM-Konfiguration & Scripts
├── 📄 vite.config.ts        # Vite Build-Konfiguration
├── 📄 tsconfig.json         # TypeScript-Konfiguration
├── 📄 tailwind.config.js    # Tailwind CSS-Konfiguration
├── 📄 nginx.conf.example    # Nginx-Server-Konfiguration
├── 📁 public/               # Statische Assets (Favicons, etc.)
├── 📁 src/
│   ├── 📄 index.tsx         # React App Entry Point
│   ├── 📄 App.tsx           # Haupt-React-Komponente
│   ├── 📄 config.ts         # API-Konfiguration
│   ├── 📄 types.ts          # TypeScript Interfaces
│   ├── 📁 components/       # React-Komponenten
│   │   ├── 📄 Hero.tsx      # Hero-Bereich
│   │   ├── 📄 Gallery.tsx   # Projekt-Galerie
│   │   ├── 📄 Contact.tsx   # Kontaktformular
│   │   ├── 📄 Navbar.tsx    # Navigation
│   │   └── 📄 Footer.tsx    # Footer
│   └── 📁 services/         # API-Services
│       └── 📄 erpnextService.ts  # ERPNext API Client
├── 📁 dist/                 # Production Build Output
└── 📁 node_modules/         # Dependencies
```

## 🌐 Netzwerk-Architektur

### 1. **Frontend-Server (Nginx)**
```
Domain: https://mm-event.live
Port: 443 (HTTPS)
Technologie: Nginx (Reverse Proxy + Static File Server)
```

**Aufgaben:**
- **Static File Serving**: HTML, CSS, JS aus `dist/` Verzeichnis
- **SPA Routing**: Alle Routen → `index.html` (Single Page Application)
- **HTTPS Termination**: SSL-Zertifikate verwalten
- **Caching**: Statische Assets (JS/CSS/Images) mit langen Cache-Zeiten
- **Security Headers**: CORS, Security Headers setzen

### 2. **API-Proxy-Server (Express.js)**
```
Domain: https://erp-api.mm-event.live
Port: 443 (HTTPS)
Technologie: Node.js + Express
```

**Aufgaben:**
- **API Gateway**: Alle API-Requests von Frontend → ERPNext weiterleiten
- **CORS Handling**: Cross-Origin Resource Sharing für Browser-Sicherheit
- **Authentication**: ERPNext API-Key/Secret weiterleiten
- **File Proxying**: `/files/*` Requests für Bilder an ERPNext weiterleiten
- **Error Handling**: API-Fehler übersetzen und an Frontend weitergeben

### 3. **Backend-System (ERPNext)**
```
Intern: http://erpnext-server:8000
Technologie: ERPNext (Frappe Framework + MariaDB)
```

**Aufgaben:**
- **Data Storage**: Projekte, Leads, Dateien speichern
- **Business Logic**: Lead-Verarbeitung, Projekt-Management
- **File Storage**: Bilder und Dokumente verwalten
- **API Endpoints**: REST API für CRUD-Operationen

## 🔧 Technische Details

### Frontend Build-Prozess

**Entwicklung:**
```bash
npm run dev          # Startet Vite Dev Server (Port 3000)
```

**Production Build:**
```bash
npm run build        # Erstellt optimierte Dateien in dist/
npm run preview      # Lokaler Test des Production Builds
```

**Build-Output (`dist/`):**
- `index.html` - Haupt-HTML-Datei
- `assets/` - Gebündelte JS/CSS + optimierte Bilder
- `favicon.ico/svg` - Favicons

### API-Kommunikation

**Konfiguration (`config.ts`):**
```typescript
export const CONFIG = {
  API_URL: "https://erp-api.mm-event.live"  // Proxy-Server URL
};
```

**Service-Layer (`erpnextService.ts`):**
- **getProjects()**: Lädt alle Projekte mit Custom-Feldern
- **getProject()**: Lädt einzelnes Projekt (inkl. Bilder)
- **createLead()**: Erstellt neue Leads aus Kontaktformular
- **getImageUrl()**: Konvertiert ERPNext-Dateipfade zu URLs

### Custom Fields in ERPNext

**Project Doctype:**
```
Standard-Felder:
├── name (String) - Projekt-ID
├── project_name (String) - Anzeigename
├── expected_end_date (Date) - Projektdatum
├── status (Select) - Projektstatus
└── notes (Text) - Beschreibung

Custom-Felder:
├── custom_location (Data) - Veranstaltungsort
├── custom_description (Text Editor) - Detaillierte Beschreibung
├── custom_image (Attach Image) - Hauptbild
├── custom_highlights (Table/Event Highlight) - Event-Highlights
└── custom_additional_images (Table/Project Image) - Zusätzliche Bilder
```

**Lead Doctype:**
```
├── first_name (Data) - Vorname
├── last_name (Data) - Nachname
├── email_id (Data) - E-Mail-Adresse
├── mobile_no (Data) - Telefonnummer
├── source (Link) - Lead-Quelle ("Webseite")
└── custom_message (Text) - Nachricht aus Formular
```

## 🔄 Datenfluss

### Projekt laden:
```
1. Frontend: Gallery.tsx → erpnextService.getProjects()
2. API-Proxy: POST /api/resource/Project → ERPNext
3. ERPNext: Gibt JSON mit Projekt-Array zurück
4. Frontend: Mappt Daten zu GalleryImage[] für Anzeige
```

### Bild laden:
```
1. Frontend: <img src="..."> lädt Bild-URL
2. API-Proxy: GET /files/bild.jpg → ERPNext File Server
3. ERPNext: Gibt Bild-Datei zurück
4. Frontend: Zeigt Bild in Galerie/Modal an
```

### Lead erstellen:
```
1. Frontend: Contact.tsx → handleSubmit()
2. API-Proxy: POST /api/resource/Lead → ERPNext
3. ERPNext: Validiert und speichert Lead
4. Frontend: Zeigt Erfolg/Error-Message
```

## 🚀 Deployment-Prozess

### 1. **Frontend Deployment**
```bash
# Lokaler Build
npm run build

# Upload zu Nginx-Server
scp -r dist/* user@server:/usr/share/nginx/html/
```

### 2. **API-Proxy Deployment**
```bash
# Auf Coolify/Node-Server
git push origin main  # Coolify deployed automatisch

# Environment Variables in Coolify:
ERP_URL=http://erpnext-server:8000
API_KEY=your-api-key
API_SECRET=your-api-secret
FRONTEND_URL=https://mm-event.live
```

### 3. **ERPNext Setup**
- **Custom Fields** im Project Doctype anlegen
- **Lead Source** "Webseite" erstellen
- **API-Key/Secret** für Proxy generieren
- **File Permissions** für öffentliche Bilder setzen

## 🔒 Sicherheit

### HTTPS Everywhere
- **Frontend**: Nginx mit Let's Encrypt SSL
- **API-Proxy**: Coolify-managed SSL
- **ERPNext**: Internes Netzwerk (HTTP ausreichend)

### API-Sicherheit
- **Token Authentication**: ERPNext API-Key/Secret
- **CORS Policy**: Nur Frontend-Domain erlaubt
- **Input Validation**: Frontend + ERPNext Validierung
- **Rate Limiting**: Durch Coolify/Node.js

### File-Sicherheit
- **Public Files**: Bilder über `/files/*` Route zugänglich
- **Private Files**: Nur authentifizierte API-Requests
- **File Types**: Nur erlaubte Bildformate

## 📊 Monitoring & Debugging

### Logs verfolgen:
```bash
# Coolify Proxy Logs
coolify logs erp-api-service

# Nginx Access Logs
tail -f /var/log/nginx/access.log

# ERPNext Logs
bench --site site1.local doctor
```

### API testen:
```bash
# Projekte laden
curl "https://erp-api.mm-event.live/api/resource/Project?fields=[\"name\",\"project_name\"]"

# Lead erstellen
curl -X POST "https://erp-api.mm-event.live/api/resource/Lead" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","email_id":"test@example.com","custom_message":"Test"}'
```

## 🔧 Wartung & Updates

### Frontend Updates:
1. Code-Änderungen in GitHub
2. `npm run build` → `dist/` aktualisiert
3. Neue Dateien auf Nginx-Server deployen

### API-Updates:
1. Code-Änderungen pushen
2. Coolify deployed automatisch
3. API-Endpoints bleiben kompatibel

### ERPNext-Updates:
1. Neue Custom Fields anlegen
2. Bestehende Daten migrieren
3. API-Tests durchführen

## 🚨 Häufige Probleme & Lösungen

### Problem: "Mixed Content" Fehler
**Ursache:** HTTPS-Website lädt HTTP-Ressourcen
**Lösung:** API_URL auf HTTPS ändern oder Proxy verwenden

### Problem: CORS-Fehler
**Ursache:** Browser blockiert Cross-Origin Requests
**Lösung:** Proxy-Server mit CORS-Headers konfigurieren

### Problem: Bilder laden nicht
**Ursache:** `/files/*` Route nicht konfiguriert
**Lösung:** Proxy-Server für Dateien einrichten

### Problem: API 500 Fehler
**Ursache:** ERPNext Server nicht erreichbar
**Lösung:** Netzwerk-Konfiguration prüfen

## 📚 Erweiterte Features

### Geplante Erweiterungen:
- **Additional Images**: Mehrere Bilder pro Projekt
- **Image Galleries**: Lightbox für Bild-Ansicht
- **Caching Layer**: Redis für API-Responses
- **CDN Integration**: Bilder über CDN ausliefern
- **Analytics**: Besucher-Tracking integrieren

### Performance-Optimierungen:
- **Code Splitting**: Lazy Loading für Komponenten
- **Image Optimization**: WebP-Format + Responsive Images
- **Bundle Analysis**: Bundle-Größe überwachen
- **Service Worker**: Offline-Caching implementieren

---

**Diese Architektur gewährleistet:**
- ✅ **Skalierbarkeit**: Jeder Service kann unabhängig skaliert werden
- ✅ **Wartbarkeit**: Klare Trennung der Verantwortlichkeiten
- ✅ **Sicherheit**: Mehrschichtige Sicherheitsarchitektur
- ✅ **Performance**: Optimierte Build- und Delivery-Pipeline
- ✅ **Entwicklerfreundlichkeit**: TypeScript + moderne Tools
