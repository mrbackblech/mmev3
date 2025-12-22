# Deployment-Anleitung

## Build für Production

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Production Build erstellen:**
   ```bash
   npm run build
   ```
   
   Dies erstellt ein `dist/` Verzeichnis mit allen optimierten Dateien.

3. **Build-Verzeichnis auf Server kopieren:**
   ```bash
   # Beispiel: dist/ Inhalt nach /usr/share/nginx/html/ kopieren
   scp -r dist/* user@server:/usr/share/nginx/html/
   ```

## Nginx-Konfiguration

Die Datei `nginx.conf.example` zeigt die empfohlene Nginx-Konfiguration für die SPA.

**Wichtige Punkte:**
- Alle Routen müssen auf `index.html` umgeleitet werden (`try_files`)
- Statische Assets sollten gecacht werden
- Favicon-Fehler sollten ignoriert werden

## Häufige Probleme

### 404-Fehler für favicon.ico
- ✅ **Gelöst:** Favicon-Link wurde zu `index.html` hinzugefügt
- Das SVG-Favicon wird automatisch von Vite verarbeitet

### 404-Fehler für Routen
- ✅ **Gelöst:** Nginx muss `try_files $uri $uri/ /index.html;` verwenden
- Siehe `nginx.conf.example`

### Build-Dateien fehlen
- Stelle sicher, dass `npm run build` ausgeführt wurde
- Prüfe, ob das `dist/` Verzeichnis existiert und Dateien enthält

## Lokale Vorschau

Nach dem Build kannst du lokal testen:
```bash
npm run preview
```

Dies startet einen lokalen Server mit dem Production-Build.
