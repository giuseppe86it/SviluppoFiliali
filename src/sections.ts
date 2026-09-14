import type { SectionDef } from './types'

const yesNoVerify = ['Sì', 'No', 'Da verificare']
const presentAbsentVerify = ['Presente', 'Assente', 'Da verificare']

export const sections: SectionDef[] = [
  {
    id: 'general', title: 'Dati generali', shortTitle: 'Dati generali', special: 'general',
    cards: [
      { title: 'Identificazione', fields: [
        { key: 'inspectionDate', label: 'Data sopralluogo', type: 'date', required: true },
        { key: 'inspectionName', label: 'Nome identificativo capannone', type: 'text', required: true }
      ]},
      { title: 'Contatto / provenienza', fields: [
        { key: 'source', label: 'Fonte', type: 'choice', options: ['Agenzia','Proprietario','Portale','Segnalazione','Altro'] },
        { key: 'ownerAgency', label: 'Agenzia / Proprietario', type: 'text' },
        { key: 'contact', label: 'Referente', type: 'text' },
        { key: 'phone', label: 'Telefono', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'listingUrl', label: 'URL annuncio', type: 'url' },
        { key: 'listingRef', label: 'Riferimento annuncio', type: 'text' }
      ]},
      { title: 'Operazione', fields: [
        { key: 'availabilityType', label: 'Tipo disponibilità', type: 'choice', options: ['Solo locazione','Solo vendita','Locazione o vendita','Da verificare'] },
        { key: 'rent', label: 'Canone richiesto', type: 'number', unit: '€/mese', showWhen: { field: 'availabilityType', in: ['Solo locazione','Locazione o vendita'] } },
        { key: 'salePrice', label: 'Prezzo richiesto', type: 'number', unit: '€', showWhen: { field: 'availabilityType', in: ['Solo vendita','Locazione o vendita'] } },
        { key: 'additionalCosts', label: 'Spese accessorie', type: 'text' },
        { key: 'propertyAvailability', label: 'Disponibilità immobile', type: 'text', placeholder: 'Immediata, data o da verificare' }
      ]},
      { title: 'Superfici dichiarate', description: 'Dati ricevuti da annuncio, proprietà o agenzia.', fields: [
        { key: 'declaredCoveredArea', label: 'Superficie coperta dichiarata', type: 'number', unit: 'm²' },
        { key: 'declaredYardArea', label: 'Superficie piazzale dichiarata', type: 'number', unit: 'm²' }
      ]},
      { title: 'Note', fields: [{ key: 'generalNotes', label: 'Note generali', type: 'textarea' }]}
    ]
  },
  {
    id: 'warehouse', title: 'Capannone', shortTitle: 'Capannone', special: 'warehouse', photoCategory: 'Capannone', measurements: true,
    cards: [
      { title: 'Superfici', fields: [
        { key: 'coveredArea', label: 'Superficie coperta rilevata/stimata', type: 'number', unit: 'm²' },
        { key: 'operationalArea', label: 'Superficie operativa interna', type: 'number', unit: 'm²' },
        { key: 'mezzanineArea', label: 'Superficie soppalchi', type: 'number', unit: 'm²' }
      ]},
      { title: 'Altezze', fields: [
        { key: 'underBeamHeight', label: 'Altezza sotto trave', type: 'number', unit: 'm' },
        { key: 'maxHeight', label: 'Altezza massima', type: 'number', unit: 'm' },
        { key: 'minHeight', label: 'Altezza minima', type: 'number', unit: 'm' }
      ]},
      { title: 'Struttura', fields: [
        { key: 'structureType', label: 'Tipologia struttura', type: 'choice', options: ['Prefabbricato','Cemento armato','Acciaio','Muratura','Mista','Altro'] },
        { key: 'bays', label: 'Numero campate', type: 'number' },
        { key: 'internalColumns', label: 'Pilastri interni', type: 'choice', options: ['No','Sì'] },
        { key: 'columnInterference', label: 'Interferiscono con la movimentazione?', type: 'choice', options: ['No','Parzialmente','Sì'], showWhen: { field: 'internalColumns', in: ['Sì'] } }
      ]},
      { title: 'Pavimentazione', fields: [
        { key: 'floorType', label: 'Tipologia pavimentazione', type: 'choice', options: ['Calcestruzzo industriale','Resina','Piastrelle','Altro'] },
        { key: 'floorState', label: 'Stato', type: 'choice', options: ['Buono','Sufficiente','Da sistemare','Critico'] },
        { key: 'floorDamage', label: 'Buche / crepe / cedimenti', type: 'choice', options: ['No','Sì'] }
      ]},
      { title: 'Copertura', fields: [
        { key: 'roofType', label: 'Tipologia', type: 'choice', options: ['Piana','Falde','Shed','Altro'] },
        { key: 'roofState', label: 'Stato visivo', type: 'choice', options: ['Buono','Da verificare','Critico'] },
        { key: 'leaks', label: 'Infiltrazioni visibili', type: 'choice', options: ['No','Sì','Da verificare'] },
        { key: 'skylights', label: 'Lucernari', type: 'choice', options: ['Sì','No'] },
        { key: 'solarPanels', label: 'Fotovoltaico', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Movimentazione interna', fields: [
        { key: 'internalMovement', label: 'Movimentazione mezzi', type: 'choice', options: ['Agevole','Possibile','Difficoltosa','Critica'] },
        { key: 'levelChanges', label: 'Dislivelli', type: 'choice', options: ['No','Sì'] },
        { key: 'ramps', label: 'Rampe', type: 'choice', options: ['No','Sì'] },
        { key: 'obstacles', label: 'Ostacoli rilevanti', type: 'choice', options: ['No','Sì'] },
        { key: 'obstacleNotes', label: 'Descrizione ostacoli', type: 'textarea', showWhen: { field: 'obstacles', in: ['Sì'] } }
      ]},
      { title: 'Note', fields: [{ key: 'warehouseNotes', label: 'Note capannone', type: 'textarea' }]}
    ]
  },
  {
    id: 'yard', title: 'Piazzale', shortTitle: 'Piazzale', photoCategory: 'Piazzale', measurements: true,
    cards: [
      { title: 'Superfici', fields: [
        { key: 'yardArea', label: 'Superficie piazzale rilevata/stimata', type: 'number', unit: 'm²' },
        { key: 'usableYardArea', label: 'Superficie realmente utilizzabile', type: 'number', unit: 'm²' },
        { key: 'yardShape', label: 'Forma del piazzale', type: 'choice', options: ['Regolare','Irregolare','Suddivisa in più aree','Altro'] }
      ]},
      { title: 'Pavimentazione', fields: [
        { key: 'yardSurface', label: 'Tipologia', type: 'choice', options: ['Asfalto','Calcestruzzo','Autobloccanti','Stabilizzato','Ghiaia','Terra','Mista','Altro'] },
        { key: 'yardSurfaceState', label: 'Stato', type: 'choice', options: ['Buono','Sufficiente','Da sistemare','Critico'] },
        { key: 'heavyVehicleSurface', label: 'Idonea ai mezzi pesanti', type: 'choice', options: yesNoVerify },
        { key: 'yardDamage', label: 'Buche / cedimenti', type: 'choice', options: ['No','Sì'] },
        { key: 'waterPooling', label: "Ristagni d'acqua", type: 'choice', options: ['No','Sì','Da verificare'] }
      ]},
      { title: 'Manovra', fields: [
        { key: 'truckManeuver', label: 'Manovra bilici', type: 'choice', options: ['Agevole','Possibile','Difficoltosa','Non possibile'] },
        { key: 'heavyManeuver', label: 'Manovra mezzi pesanti', type: 'choice', options: ['Agevole','Possibile','Difficoltosa','Non possibile'] },
        { key: 'internalTurn', label: 'Inversione interna', type: 'choice', options: ['Sì','No'] },
        { key: 'yardObstacles', label: 'Ostacoli nel piazzale', type: 'choice', options: ['No','Sì'] },
        { key: 'yardObstacleNotes', label: 'Descrivi ostacoli', type: 'textarea', showWhen: { field: 'yardObstacles', in: ['Sì'] } }
      ]},
      { title: 'Deposito mezzi', fields: [
        { key: 'vehicleStorage', label: 'Adatto al deposito mezzi', type: 'choice', options: ['Sì','Parzialmente','No'] },
        { key: 'organizedStorage', label: 'Deposito organizzabile in modo funzionale', type: 'choice', options: yesNoVerify },
        { key: 'largeVehicles', label: 'Spazio per mezzi di grandi dimensioni', type: 'choice', options: yesNoVerify },
        { key: 'customerSeparation', label: 'Separazione area operativa / clienti', type: 'choice', options: ['Presente','Realizzabile','Non realizzabile','Da verificare'] }
      ]},
      { title: 'Recinzione e chiusura', fields: [
        { key: 'fenced', label: 'Piazzale recintato', type: 'choice', options: ['Sì','Parzialmente','No'] },
        { key: 'fenceState', label: 'Stato recinzione', type: 'choice', options: ['Buono','Da sistemare','Critico'] },
        { key: 'siteClosable', label: 'Sito completamente chiudibile', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Illuminazione esterna', fields: [{ key: 'yardLighting', label: 'Illuminazione piazzale', type: 'choice', options: ['Adeguata','Parziale','Assente','Da verificare'] }]},
      { title: 'Predisposizioni esterne', fields: [
        { key: 'externalWater', label: 'Punto acqua esterno', type: 'choice', options: presentAbsentVerify },
        { key: 'externalDrain', label: 'Scarico esterno', type: 'choice', options: presentAbsentVerify },
        { key: 'externalPower', label: 'Alimentazione elettrica esterna', type: 'choice', options: presentAbsentVerify }
      ]},
      { title: 'Area lavaggio', fields: [
        { key: 'washSpace', label: 'Spazio individuabile per area lavaggio', type: 'choice', options: yesNoVerify },
        { key: 'washSpacePosition', label: 'Posizione ipotizzata', type: 'text', showWhen: { field: 'washSpace', in: ['Sì','Da verificare'] } },
        { key: 'washSpaceNotes', label: 'Note', type: 'textarea', showWhen: { field: 'washSpace', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Area rifornimento', fields: [
        { key: 'fuelSpace', label: 'Spazio individuabile per area rifornimento', type: 'choice', options: yesNoVerify },
        { key: 'fuelSpacePosition', label: 'Posizione ipotizzata', type: 'text', showWhen: { field: 'fuelSpace', in: ['Sì','Da verificare'] } },
        { key: 'fuelSpaceNotes', label: 'Note', type: 'textarea', showWhen: { field: 'fuelSpace', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Cavi elettrici aerei', fields: [
        { key: 'overheadPowerLines', label: 'Presenza cavi elettrici aerei', type: 'choice', options: yesNoVerify },
        { key: 'overheadPowerNotes', label: 'Note', type: 'textarea', showWhen: { field: 'overheadPowerLines', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Ampliamento', fields: [
        { key: 'yardExpansion', label: 'Ampliamento piazzale possibile', type: 'choice', options: yesNoVerify },
        { key: 'yardExpansionArea', label: 'Area indicativa disponibile', type: 'number', unit: 'm²', showWhen: { field: 'yardExpansion', in: ['Sì'] } },
        { key: 'yardExpansionNotes', label: 'Note', type: 'textarea', showWhen: { field: 'yardExpansion', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Note', fields: [{ key: 'yardNotes', label: 'Note piazzale', type: 'textarea' }]}
    ]
  },
  {
    id: 'access', title: 'Accessibilità e viabilità', shortTitle: 'Accessibilità', special: 'access', photoCategory: 'Accessibilità e viabilità', measurements: true,
    cards: [
      { title: 'Accesso al sito', fields: [
        { key: 'drivewayCount', label: 'Numero accessi carrabili', type: 'number' },
        { key: 'mainAccess', label: 'Accesso principale', type: 'choice', options: ['Diretto da strada pubblica','Da strada privata','Condiviso','Altro'] },
        { key: 'independentAccess', label: 'Accesso indipendente', type: 'choice', options: yesNoVerify },
        { key: 'semiAccess', label: 'Accesso bilici', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile','Da verificare'] },
        { key: 'heavyAccess', label: 'Accesso mezzi pesanti', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile','Da verificare'] }
      ]},
      { title: 'Viabilità immediata', fields: [
        { key: 'roadWidth', label: 'Larghezza strada', type: 'number', unit: 'm' },
        { key: 'oneWay', label: 'Senso unico', type: 'choice', options: ['Sì','No'] },
        { key: 'twoHeavyPassing', label: 'Incrocio tra due mezzi pesanti', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile','Da verificare'] },
        { key: 'tightCurves', label: 'Curve strette', type: 'choice', options: ['Sì','No'] },
        { key: 'bottlenecks', label: 'Strettoie', type: 'choice', options: ['Sì','No'] },
        { key: 'bridgesUnderpasses', label: 'Ponti / sottopassi sul percorso immediato', type: 'choice', options: yesNoVerify },
        { key: 'heightLimits', label: 'Limitazioni di altezza', type: 'choice', options: yesNoVerify },
        { key: 'weightLimits', label: 'Limitazioni di peso', type: 'choice', options: yesNoVerify },
        { key: 'heavyTrafficLimits', label: 'Divieti / limitazioni mezzi pesanti', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Manovra esterna', fields: [
        { key: 'outsideWaiting', label: 'Possibilità di attendere fuori dal sito', type: 'choice', options: ['Sì','Limitata','No'] },
        { key: 'easyEntry', label: 'Ingresso agevole senza manovre complesse', type: 'choice', options: ['Sì','Parzialmente','No'] },
        { key: 'easyExit', label: 'Uscita agevole', type: 'choice', options: ['Sì','Parzialmente','No'] }
      ]},
      { title: 'Parcheggi', fields: [
        { key: 'customerParking', label: 'Parcheggi clienti', type: 'choice', options: ['Adeguati','Presenti ma insufficienti','Realizzabili','Assenti'] },
        { key: 'customerParkingCount', label: 'Numero posti clienti', type: 'number' },
        { key: 'employeeParking', label: 'Parcheggi dipendenti', type: 'choice', options: ['Adeguati','Presenti ma insufficienti','Realizzabili','Assenti'] },
        { key: 'employeeParkingCount', label: 'Numero posti dipendenti', type: 'number' },
        { key: 'companyVehicleParking', label: 'Parcheggio mezzi aziendali', type: 'choice', options: ['Presente','Realizzabile','Assente','Da verificare'] }
      ]},
      { title: 'Criticità viarie', fields: [
        { key: 'roadIssues', label: 'Criticità', type: 'choice', options: ['Nessuna','Strada stretta','Curve critiche','Pendenze','Divieti mezzi pesanti','Area residenziale','Traffico intenso','Altro'] },
        { key: 'roadIssueNotes', label: 'Note criticità', type: 'textarea' }
      ]},
      { title: 'Note', fields: [{ key: 'accessNotes', label: 'Note accessibilità e viabilità', type: 'textarea' }]}
    ]
  },
  {
    id: 'offices', title: 'Uffici e servizi', shortTitle: 'Uffici', photoCategory: 'Uffici e servizi', measurements: true,
    cards: [
      { title: 'Superficie e distribuzione', fields: [
        { key: 'officeArea', label: 'Superficie uffici', type: 'number', unit: 'm²' },
        { key: 'officeRooms', label: 'Numero locali', type: 'number' },
        { key: 'officeLayout', label: 'Distribuzione', type: 'choice', options: ['Open space','Uffici separati','Mista','Da riconfigurare'] },
        { key: 'officeFloor', label: 'Piano', type: 'choice', options: ['Piano terra','Primo piano','Più livelli'] },
        { key: 'independentOfficeEntry', label: 'Ingresso uffici indipendente', type: 'choice', options: yesNoVerify },
        { key: 'warehouseConnection', label: 'Collegamento diretto con capannone', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Reception / area clienti', fields: [
        { key: 'reception', label: 'Reception / area clienti', type: 'choice', options: ['Presente','Realizzabile','Non realizzabile','Da verificare'] },
        { key: 'customerSeparateAccess', label: "Accesso clienti separato dall'area operativa", type: 'choice', options: ['Sì','No','Realizzabile','Da verificare'] },
        { key: 'officeEntryVisibility', label: 'Visibilità ingresso', type: 'choice', options: ['Buona','Sufficiente','Scarsa'] }
      ]},
      { title: 'Spazi ufficio', fields: [
        { key: 'officeAdequacy', label: 'Spazi ufficio complessivamente adeguati', type: 'choice', options: ['Sì','Con modifiche','No','Da verificare'] },
        { key: 'meetingRoom', label: 'Sala riunioni', type: 'choice', options: ['Presente','Realizzabile','Assente'] },
        { key: 'officeReconfiguration', label: 'Possibilità di riconfigurazione interna', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Servizi igienici', fields: [
        { key: 'bathroomCount', label: 'Numero bagni', type: 'number' },
        { key: 'bathroomState', label: 'Stato', type: 'choice', options: ['Buono','Sufficiente','Da sistemare','Critico'] },
        { key: 'accessibleBathroom', label: 'Bagno accessibile', type: 'choice', options: ['Presente','Assente','Da verificare'] }
      ]},
      { title: 'Spogliatoi e personale', fields: [
        { key: 'lockerRoom', label: 'Spogliatoio', type: 'choice', options: ['Presente','Realizzabile','Assente'] },
        { key: 'showers', label: 'Docce', type: 'choice', options: ['Presenti','Realizzabili','Assenti'] },
        { key: 'breakRoom', label: 'Locale ristoro / pausa', type: 'choice', options: ['Presente','Realizzabile','Assente'] }
      ]},
      { title: 'Comfort', fields: [
        { key: 'officeClimate', label: 'Riscaldamento / climatizzazione', type: 'choice', options: ['Adeguato','Presente ma da migliorare','Assente','Da verificare'] },
        { key: 'naturalLight', label: 'Illuminazione naturale', type: 'choice', options: ['Buona','Sufficiente','Scarsa'] }
      ]},
      { title: 'Stato generale', fields: [{ key: 'officeState', label: 'Stato uffici e servizi', type: 'choice', options: ['Buono','Sufficiente','Da sistemare','Critico'] }]},
      { title: 'Note', fields: [{ key: 'officeNotes', label: 'Note uffici e servizi', type: 'textarea' }]}
    ]
  },
  {
    id: 'workshop', title: 'Area officina', shortTitle: 'Area officina', photoCategory: 'Area officina', measurements: true,
    cards: [
      { title: 'Fattibilità', fields: [
        { key: 'workshopPossible', label: 'Area officina ricavabile', type: 'choice', options: yesNoVerify },
        { key: 'workshopPosition', label: 'Posizione ipotizzata', type: 'text', showWhen: { field: 'workshopPossible', in: ['Sì','Da verificare'] } },
        { key: 'workshopDirectYard', label: 'Accesso diretto dal piazzale', type: 'choice', options: yesNoVerify, showWhen: { field: 'workshopPossible', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Spazio disponibile', fields: [
        { key: 'workshopArea', label: 'Superficie disponibile', type: 'number', unit: 'm²' },
        { key: 'workshopHeight', label: 'Altezza utile', type: 'number', unit: 'm' },
        { key: 'workshopSpace', label: 'Spazio sufficiente per ingresso e lavorazione mezzi', type: 'choice', options: ['Sì','Parzialmente','No'] },
        { key: 'workshopObstacles', label: 'Pilastri / ostacoli', type: 'choice', options: ['No','Sì'] },
        { key: 'workshopObstacleNotes', label: 'Descrivi ostacolo', type: 'textarea', showWhen: { field: 'workshopObstacles', in: ['Sì'] } }
      ]},
      { title: 'Ponte sollevatore', fields: [
        { key: 'liftPossible', label: 'Ponte installabile', type: 'choice', options: yesNoVerify },
        { key: 'liftHeight', label: 'Altezza sufficiente', type: 'choice', options: yesNoVerify },
        { key: 'liftFloor', label: 'Pavimentazione apparentemente idonea', type: 'choice', options: yesNoVerify },
        { key: 'liftClearance', label: 'Spazio libero attorno al ponte', type: 'choice', options: ['Adeguato','Limitato','Insufficiente'] }
      ]},
      { title: 'Parete attrezzata', fields: [
        { key: 'equippedWall', label: 'Parete disponibile', type: 'choice', options: yesNoVerify },
        { key: 'freeWall', label: 'Parete sufficientemente libera', type: 'choice', options: yesNoVerify },
        { key: 'benchShelves', label: 'Banco / scaffalature / attrezzature realizzabili', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Predisposizioni', fields: [
        { key: 'workshopPower', label: 'Energia elettrica nelle vicinanze', type: 'choice', options: yesNoVerify },
        { key: 'workshopThreePhase', label: 'Trifase', type: 'choice', options: yesNoVerify },
        { key: 'workshopWater', label: 'Punto acqua nelle vicinanze', type: 'choice', options: yesNoVerify },
        { key: 'compressedAir', label: 'Aria compressa realizzabile', type: 'choice', options: yesNoVerify },
        { key: 'workshopLighting', label: 'Illuminazione', type: 'choice', options: ['Adeguata','Da integrare','Insufficiente'] }
      ]},
      { title: 'Movimentazione', fields: [
        { key: 'yardWorkshopPath', label: 'Percorso piazzale → area officina', type: 'choice', options: ['Diretto','Con interferenze','Critico'] },
        { key: 'workshopVehicleEntry', label: 'Ingresso mezzi', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile'] }
      ]},
      { title: 'Note', fields: [{ key: 'workshopNotes', label: 'Note area officina', type: 'textarea' }]}
    ]
  },
  {
    id: 'systems', title: 'Impianti', shortTitle: 'Impianti', special: 'systems', photoCategory: 'Impianti',
    cards: [
      { title: 'Elettrico', fields: [
        { key: 'electrical', label: 'Impianto elettrico', type: 'choice', options: presentAbsentVerify },
        { key: 'threePhase', label: 'Trifase', type: 'choice', options: presentAbsentVerify },
        { key: 'availablePower', label: 'Potenza disponibile', type: 'number', unit: 'kW' },
        { key: 'industrialSockets', label: 'Prese industriali', type: 'choice', options: ['Presenti','Assenti','Da verificare'] }
      ]},
      { title: 'Acqua e scarichi', fields: [
        { key: 'waterConnection', label: 'Allacciamento acqua', type: 'choice', options: presentAbsentVerify },
        { key: 'sewer', label: 'Scarichi / fognatura', type: 'choice', options: ['Presenti','Assenti','Da verificare'] }
      ]},
      { title: 'Riscaldamento e climatizzazione', fields: [
        { key: 'warehouseHeating', label: 'Riscaldamento capannone', type: 'choice', options: presentAbsentVerify },
        { key: 'officeHeatingCooling', label: 'Riscaldamento / climatizzazione uffici', type: 'choice', options: presentAbsentVerify }
      ]},
      { title: 'Illuminazione', fields: [{ key: 'internalLighting', label: 'Illuminazione interna capannone', type: 'choice', options: ['Adeguata','Da migliorare','Insufficiente','Da verificare'] }]},
      { title: 'Connessione', fields: [{ key: 'internet', label: 'Fibra / connessione internet', type: 'choice', options: ['Disponibile','Non disponibile','Da verificare'] }]},
      { title: 'Fotovoltaico', fields: [
        { key: 'pvSystem', label: 'Impianto fotovoltaico', type: 'choice', options: presentAbsentVerify },
        { key: 'pvPower', label: 'Potenza', type: 'number', unit: 'kWp', showWhen: { field: 'pvSystem', in: ['Presente'] } }
      ]},
      { title: 'Antincendio', fields: [{ key: 'fireSafety', label: 'Impianto / dotazioni antincendio', type: 'choice', options: ['Presenti','Assenti','Da verificare'] }]},
      { title: 'Stato generale', fields: [{ key: 'systemsState', label: 'Stato generale impianti', type: 'choice', options: ['Buono','Sufficiente','Da verificare','Critico'] }]},
      { title: 'Note', fields: [{ key: 'systemsNotes', label: 'Note impianti', type: 'textarea' }]}
    ]
  },
  {
    id: 'wash', title: 'Area lavaggio', shortTitle: 'Lavaggio', photoCategory: 'Area lavaggio', measurements: true,
    cards: [
      { title: 'Fattibilità', fields: [
        { key: 'washPossible', label: 'Area lavaggio realizzabile', type: 'choice', options: yesNoVerify },
        { key: 'washPosition', label: 'Posizione ipotizzata', type: 'text', showWhen: { field: 'washPossible', in: ['Sì','Da verificare'] } },
        { key: 'washArea', label: 'Superficie disponibile', type: 'number', unit: 'm²', showWhen: { field: 'washPossible', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Accessibilità', fields: [
        { key: 'washAccess', label: 'Accesso mezzi', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile'] },
        { key: 'washManeuver', label: 'Spazio di manovra sufficiente', type: 'choice', options: yesNoVerify },
        { key: 'washSeparable', label: 'Area separabile dal resto del piazzale', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Predisposizioni', fields: [
        { key: 'washWater', label: 'Punto acqua nelle vicinanze', type: 'choice', options: yesNoVerify },
        { key: 'washDrain', label: 'Scarico nelle vicinanze', type: 'choice', options: yesNoVerify },
        { key: 'washPower', label: 'Alimentazione elettrica disponibile', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Pavimentazione', fields: [
        { key: 'washSurface', label: 'Pavimentazione esistente', type: 'choice', options: ['Idonea','Da adeguare','Non idonea','Da verificare'] },
        { key: 'washFlat', label: 'Area pianeggiante', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Note', fields: [{ key: 'washNotes', label: 'Note area lavaggio', type: 'textarea' }]}
    ]
  },
  {
    id: 'fuel', title: 'Area rifornimento', shortTitle: 'Rifornimento', photoCategory: 'Area rifornimento', measurements: true,
    cards: [
      { title: 'Fattibilità', fields: [
        { key: 'fuelPossible', label: 'Area rifornimento realizzabile', type: 'choice', options: yesNoVerify },
        { key: 'fuelPosition', label: 'Posizione ipotizzata', type: 'text', showWhen: { field: 'fuelPossible', in: ['Sì','Da verificare'] } }
      ]},
      { title: 'Accessibilità', fields: [
        { key: 'fuelAccess', label: 'Accesso mezzi', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile'] },
        { key: 'tankerAccess', label: 'Accesso autobotte', type: 'choice', options: ['Agevole','Possibile','Difficoltoso','Non possibile','Da verificare'] }
      ]},
      { title: 'Interferenze', fields: [
        { key: 'fuelInterference', label: 'Interferenza con movimentazione piazzale', type: 'choice', options: ['Nessuna','Limitata','Critica','Da verificare'] },
        { key: 'fuelInterferenceNotes', label: 'Descrizione interferenza', type: 'textarea', showWhen: { field: 'fuelInterference', in: ['Limitata','Critica'] } }
      ]},
      { title: 'Note', fields: [{ key: 'fuelNotes', label: 'Note area rifornimento', type: 'textarea' }]}
    ]
  },
  {
    id: 'planning', title: 'Urbanistica e autorizzazioni', shortTitle: 'Urbanistica', special: 'planning',
    cards: [
      { title: 'Compatibilità attività', fields: [
        { key: 'useCompatible', label: "Destinazione d'uso compatibile", type: 'choice', options: yesNoVerify },
        { key: 'rentalCompatible', label: 'Attività di noleggio compatibile', type: 'choice', options: yesNoVerify },
        { key: 'maintenanceCompatible', label: 'Attività di manutenzione / area officina interna compatibile', type: 'choice', options: yesNoVerify },
        { key: 'storageCompatible', label: 'Uso del piazzale per deposito mezzi compatibile', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Documentazione disponibile', fields: [
        { key: 'docAgibility', label: 'Agibilità', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] },
        { key: 'docPlan', label: 'Planimetria', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] },
        { key: 'docPlanning', label: 'Documentazione urbanistica', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] },
        { key: 'docSystems', label: 'Conformità impianti', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] },
        { key: 'docFire', label: 'Documentazione antincendio / CPI', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] },
        { key: 'docApe', label: 'APE', type: 'choice', options: ['Disponibile','Non disponibile','Da richiedere','Da verificare'] }
      ]},
      { title: 'Criticità note', fields: [
        { key: 'asbestos', label: 'Amianto / eternit', type: 'choice', options: ['No','Sì','Da verificare'] },
        { key: 'buildingIrregularities', label: 'Difformità edilizie note', type: 'choice', options: ['No','Sì','Da verificare'] },
        { key: 'knownConstraints', label: 'Vincoli o limitazioni note', type: 'choice', options: ['No','Sì','Da verificare'] }
      ]},
      { title: 'Attività esterne', fields: [
        { key: 'washAuthorizable', label: 'Area lavaggio autorizzabile', type: 'choice', options: yesNoVerify },
        { key: 'fuelAuthorizable', label: 'Area rifornimento autorizzabile', type: 'choice', options: yesNoVerify },
        { key: 'signageAllowed', label: 'Insegne esterne consentite', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Note', fields: [{ key: 'planningNotes', label: 'Note urbanistiche e autorizzative', type: 'textarea' }]}
    ]
  },
  {
    id: 'location', title: 'Posizione e zona commerciale', shortTitle: 'Posizione', special: 'location', photoCategory: 'Posizione / zona',
    cards: [
      { title: 'Inquadramento zona', fields: [
        { key: 'areaType', label: 'Tipologia area', type: 'choice', options: ['Industriale','Artigianale','Commerciale','Mista','Altro'] },
        { key: 'areaContext', label: 'Contesto', type: 'choice', options: ['Consolidato','In sviluppo','Isolato','Da verificare'] },
        { key: 'targetActivities', label: 'Presenza attività compatibili con il target Mollo', type: 'choice', options: ['Alta','Media','Bassa','Da verificare'] }
      ]},
      { title: 'Collegamenti principali', fields: [
        { key: 'mainRoad', label: 'Strada principale più vicina', type: 'text' },
        { key: 'mainRoadDistance', label: 'Distanza strada principale', type: 'number', unit: 'km' },
        { key: 'ringRoad', label: 'Tangenziale / raccordo più vicino', type: 'text' },
        { key: 'ringRoadDistance', label: 'Distanza tangenziale / raccordo', type: 'number', unit: 'km' },
        { key: 'motorway', label: 'Autostrada più vicina', type: 'text' },
        { key: 'motorwayDistance', label: 'Distanza autostrada', type: 'number', unit: 'km' },
        { key: 'tollbooth', label: 'Casello più vicino', type: 'text' },
        { key: 'tollboothDistance', label: 'Distanza casello', type: 'number', unit: 'km' },
        { key: 'tollboothMinutes', label: 'Tempo indicativo dal casello', type: 'number', unit: 'min' }
      ]},
      { title: 'Visibilità', fields: [
        { key: 'visibility', label: 'Visibilità dalla viabilità principale', type: 'choice', options: ['Ottima','Buona','Sufficiente','Scarsa'] },
        { key: 'roadFront', label: 'Fronte strada', type: 'choice', options: ['Sì','Parziale','No'] },
        { key: 'visibleSign', label: 'Possibilità di insegna visibile', type: 'choice', options: yesNoVerify }
      ]},
      { title: 'Bacino operativo', fields: [
        { key: 'industrialPresence', label: 'Presenza aziende industriali / artigiane', type: 'choice', options: ['Alta','Media','Bassa'] },
        { key: 'constructionPresence', label: 'Presenza attività edilizie / cantieri', type: 'choice', options: ['Alta','Media','Bassa','Da verificare'] },
        { key: 'commercialPotential', label: 'Potenziale commerciale percepito', type: 'choice', options: ['Alto','Medio','Basso','Da verificare'] }
      ]},
      { title: 'Competitor', fields: [{ key: 'competitorsPresent', label: 'Competitor presenti', type: 'choice', options: yesNoVerify }]},
      { title: 'Note', fields: [{ key: 'locationNotes', label: 'Note posizione e zona commerciale', type: 'textarea' }]}
    ]
  },
  { id: 'configuration', title: 'Configurazione filiale', shortTitle: 'Configurazione', special: 'configuration', cards: [] },
  { id: 'photos', title: 'Foto', shortTitle: 'Foto', special: 'photos', cards: [] },
  { id: 'documents', title: 'Documenti', shortTitle: 'Documenti', special: 'documents', cards: [] },
  { id: 'evaluation', title: 'Valutazione finale', shortTitle: 'Valutazione', special: 'evaluation', cards: [] }
]

export const photoCategories = [
  'Esterno','Accessibilità e viabilità','Piazzale','Capannone','Uffici e servizi','Area officina','Impianti','Area lavaggio','Area rifornimento','Cavi elettrici aerei','Posizione / zona','Criticità','Altro'
]

export const documentCategories = ['Planimetria','Visura','APE','Agibilità','Documentazione urbanistica','Documentazione antincendio / CPI','Documentazione impianti','Contratto / proposta','Altro']
