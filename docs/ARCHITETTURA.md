# Sviluppo Filiali — architettura funzionale

## Obiettivo
PWA Android-first per sopralluoghi di capannoni destinati a nuove filiali. Il codice è distribuibile su GitHub Pages; dati, foto e documenti operativi restano nel browser/dispositivo tramite IndexedDB.

## Flusso
Home → Nuovo sopralluogo → 15 sezioni di rilievo → Valutazione → Scheda tecnica PDF → Archivio/Mappa/Condivisione.

## Sezioni del sopralluogo
1. Dati generali
2. Capannone
3. Piazzale
4. Accessibilità e viabilità
5. Uffici e servizi
6. Area officina
7. Impianti
8. Area lavaggio
9. Area rifornimento
10. Urbanistica e autorizzazioni
11. Posizione e zona commerciale
12. Configurazione filiale (automatica)
13. Foto
14. Documenti
15. Valutazione finale

## Moduli esterni al sopralluogo
16. Archivio
17. Mappa
18. Scheda tecnica
19. Condivisione/email
20. Backup/ripristino
21. Impostazioni/sicurezza
22. Home/dashboard

## Offline
Il service worker mette in cache l'interfaccia. IndexedDB contiene schede, foto, documenti, filiali e impostazioni. GPS funziona senza rete; reverse geocoding e tile cartografiche richiedono connessione salvo cache.

## Sicurezza
PIN locale con hash SHA-256. Il PIN limita l'accesso all'interfaccia; non costituisce cifratura completa del database IndexedDB. I backup possono essere ulteriormente protetti in una fase successiva.

## Algoritmo
Pesi macro-area predefiniti: Accessibilità 20%, Piazzale 20%, Capannone 15%, Configurazione 20%, Posizione 15%, Uffici 5%, Impianti+Urbanistica 5%. Le soglie e i requisiti bloccanti sono modificabili dalle Impostazioni.

## Filiali Mollo
Le coordinate delle filiali sono gestite in un archivio locale importabile da CSV/JSON. Questo evita di incorporare nel codice un elenco destinato a cambiare. La distanza offline è geografica; il link Google Maps consente la navigazione esterna.
