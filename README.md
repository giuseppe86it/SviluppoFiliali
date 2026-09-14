# Sviluppo Filiali

PWA Android-first per sopralluoghi e archivio capannoni, progettata offline-first con dati operativi conservati sul dispositivo e codice pubblicabile su GitHub Pages.

## Versione 0.1.3

Aggiornamento orientato alla velocità sul campo.

### Sopralluogo Rapido

Il nuovo flusso `Nuovo sopralluogo` apre una singola scheda verticale per raccogliere live solo i dati difficili da ricostruire dopo:

- GPS e posizione;
- dati economici essenziali;
- superficie coperta, piazzale e uffici;
- altezze e dimensioni dei portoni;
- accessibilità e manovra;
- stato essenziale di piazzale e capannone;
- fattibilità officina, lavaggio e rifornimento;
- impianti essenziali;
- foto rapide categorizzate automaticamente;
- note live e criticità;
- prima impressione personale.

I dati della scheda rapida alimentano direttamente le corrispondenti sezioni della scheda completa, evitando doppie compilazioni.

### Report

Sono disponibili tre output:

1. **Report rapido** — A4, 1 pagina, dati live, foto e prima impressione; condivisibile subito via email.
2. **Scheda tecnica sintetica** — A4, 1 pagina, riepilogo finale con punteggio.
3. **Report completo** — multipagina, include tutti i campi delle 15 schede, allegati descrittivi e appendice fotografica.

### Correzioni UX

- i sopralluoghi spostati nel Cestino non compaiono più in Home, KPI, zone recenti o mappa;
- passando alla scheda successiva/precedente o scegliendo una sezione, la pagina riparte dall'alto;
- accesso rapido alla modalità live anche da Archivio e dal menu Sezioni.

## Sviluppo locale

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## GitHub Pages

Il repository include `.github/workflows/deploy.yml`. In **Settings → Pages** selezionare **GitHub Actions** come sorgente di pubblicazione.
