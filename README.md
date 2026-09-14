# Sviluppo Filiali

PWA Android-first per sopralluoghi e archivio capannoni. È stata progettata per funzionare **offline-first**, con dati operativi conservati sul dispositivo e codice pubblicabile su GitHub Pages.

## Funzioni incluse

- 15 sezioni guidate di sopralluogo con salvataggio automatico.
- GPS, correzione del punto su mappa e apertura in Google Maps.
- Archivio per zone, ricerca, ordinamento e cestino.
- Foto (max 5 per categoria), scatto/caricamento, annotazioni, foto principale e selezione per report.
- Documenti locali, URL annuncio e collegamento con checklist urbanistica.
- Configurazione filiale e punteggio 0–100 automatici, completezza separata e requisiti bloccanti.
- Scheda tecnica PDF A4 landscape, una pagina, con parte economica e data sopralluogo.
- Condivisione Android tramite Web Share API e fallback email.
- Backup completo o per zona in file `.sfbackup`, importazione merge/replace.
- PIN locale di accesso.
- Elenco filiali Mollo importabile per calcolo della sede più vicina.
- PWA installabile e service worker per uso offline.

## Stack

- React 19 + TypeScript
- Vite 8
- Dexie / IndexedDB
- vite-plugin-pwa / Workbox
- Leaflet + OpenStreetMap
- jsPDF
- JSZip

## Avvio locale

```bash
npm install
npm run dev
```

Aprire l'indirizzo mostrato da Vite. Per testare installazione PWA e geolocalizzazione è preferibile HTTPS oppure `localhost`.

## Build

```bash
npm run build
npm run preview
```

## Pubblicazione su GitHub Pages

1. Crea un repository GitHub.
2. Carica tutto il contenuto di questa cartella nella branch `main`.
3. Nel repository apri **Settings → Pages** e scegli **GitHub Actions** come Source.
4. Il workflow `.github/workflows/deploy.yml` esegue installazione, build e deploy dopo ogni push su `main`.

Il progetto usa `base: './'`, quindi può essere pubblicato anche come project site (`https://utente.github.io/nome-repo/`).

## Installazione su Android

Dopo il deploy HTTPS, apri il sito in Chrome e usa **Installa app / Aggiungi a schermata Home**. La PWA viene aperta in modalità standalone.

## Dati e privacy

GitHub Pages ospita **solo il frontend**. Schede, foto, documenti e valutazioni vengono memorizzati in IndexedDB sul dispositivo. Cancellare i dati del sito/browser può eliminare l'archivio: usare regolarmente **Backup e ripristino**.

## Filiali Mollo

Per il calcolo della filiale più vicina importa un CSV con separatore `;`:

```text
name;municipality;province;address;lat;lng
```

È incluso `BRANCH_IMPORT_TEMPLATE.csv`. Sono accettati anche JSON con gli stessi campi.

## Reverse geocoding e mappe

- GPS: Web Geolocation API.
- Reverse geocoding online: OpenStreetMap/Nominatim.
- Mappa: Leaflet con tile OpenStreetMap.
- Navigazione esterna: Google Maps.

Le coordinate continuano a essere registrate offline; indirizzo automatico e cartografia possono richiedere connessione.

## Stato di questa versione

Versione `0.1.1`: implementa l'architettura concordata, include il workflow GitHub Pages corretto senza dipendenza da un lock file npm e costituisce la base da provare nei sopralluoghi reali. Prima di un uso aziendale esteso vanno effettuati test su dispositivi Android reali, test di storage con molte foto/documenti e verifica delle policy interne sui dati.

Vedi anche `docs/ARCHITETTURA.md`.
