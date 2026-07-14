export type Language = "fr" | "en" | "de" | "it" | "es";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export type ActivityCategory =
  | "Nature"
  | "Culture"
  | "Gastronomy"
  | "Sport"
  | "Relaxation";

/**
 * Une activite reelle, issue d'OpenStreetMap.
 *
 * Tous les champs optionnels le sont parce qu'OSM ne les renseigne pas
 * systematiquement. Un champ absent doit rester absent a l'affichage :
 * il ne doit jamais etre remplace par une valeur inventee.
 */
export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  icon: string;
  /** Ce que le lieu EST, deduit des tags OSM : "Musée", "Château", "Cascade". */
  typeLabel: string;
  lat: number;
  lng: number;
  /** Distance reelle depuis le point de recherche, en kilometres. */
  distanceKm: number;
  /** Tarification, uniquement si OSM la renseigne. */
  fee: "free" | "paid" | "unknown";
  charge?: string;
  website?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  address?: string;
  wheelchair?: string;
  /** Fiche du lieu sur OpenStreetMap (source verifiable). */
  osmUrl: string;
  /** Recherche Google Maps du lieu : y consulter les vrais avis. */
  mapsUrl: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: string;
  read: boolean;
}

export interface UserCloudState {
  userId: string;
  favorites: string[];
  isPremium: boolean;
  biometricEnabled: boolean;
  pushNotifications: PushNotification[];
  customNotes: { [activityId: string]: string };
}

export interface LocalizationDictionary {
  appName: string;
  searchPlaceholder: string;
  searchButton: string;
  geolocationButton: string;
  geolocatingText: string;
  noActivitiesText: string;
  categoryLabel: string;
  periodLabel: string;
  priceLabel: string;
  bookingLabel: string;
  comparisonLabel: string;
  reviewsLabel: string;
  phoneLabel: string;
  emailLabel: string;
  directBookingLabel: string;
  lockedPremiumLabel: string;
  premiumUnlockTitle: string;
  premiumUnlockDesc: string;
  subscribeButton: string;
  customNotePlaceholder: string;
  customNoteSaveButton: string;
  customNoteTitle: string;
  cloudSyncTitle: string;
  cloudSyncPlaceholder: string;
  cloudSyncConnectButton: string;
  cloudSyncStatusConnected: string;
  biometricTitle: string;
  biometricScanButton: string;
  biometricSuccess: string;
  biometricEnabledLabel: string;
  biometricDesc: string;
  notificationPushTitle: string;
  notificationsTitle: string;
  notificationSimulateButton: string;
  notificationSimulatePlaceholder: string;
  notificationSimulateBodyPlaceholder: string;
  pricingMonthly: string;
  premiumFeaturesList: string[];
  seasons: { [key in Season]: string };
  categories: { [key: string]: string };
  privacyConsent: string;
  emptyFavorites: string;
  backToTop: string;
  contactSupport: string;
  prioritySupportBtn: string;
  supportSuccessMsg: string;
  biometricFail: string;
  biometricAuthTitle: string;
  biometricAuthSubtitle: string;
  cancelLabel: string;
  favoritesTab: string;
  discoverTab: string;
  settingsTab: string;
  notificationsTab: string;
  freeTierLabel: string;
  premiumTierLabel: string;
  syncDeviceSuccess: string;
}

export const LOCALIZATION: { [key in Language]: LocalizationDictionary } = {
  fr: {
    appName: "Saison & Terroir",
    searchPlaceholder: "Saisissez une ville, région, ou adresse...",
    searchButton: "Rechercher",
    geolocationButton: "Me géolocaliser",
    geolocatingText: "Géolocalisation en cours...",
    noActivitiesText: "Aucune activité trouvée pour cette saison et ce lieu. Essayez de lancer une recherche !",
    categoryLabel: "Catégorie",
    periodLabel: "Période idéale",
    priceLabel: "Tarif indicatif",
    bookingLabel: "Réservations & Liens",
    comparisonLabel: "Comparatif & Évaluation",
    reviewsLabel: "Avis Google",
    phoneLabel: "Numéro de téléphone",
    emailLabel: "Adresse e-mail",
    directBookingLabel: "Contacter pour réserver",
    lockedPremiumLabel: "Contenu verrouillé (Réservé Premium)",
    premiumUnlockTitle: "Devenez Membre Premium ✨",
    premiumUnlockDesc: "Débloquez l'accès instantané aux réservations, numéros de téléphone directs, e-mails d'inscription automatique, notifications push personnalisées et support prioritaire 24/7.",
    subscribeButton: "S'abonner pour 4,99 € / mois",
    customNotePlaceholder: "Ajoutez une note personnelle pour cette activité (mémo de réservation, heure d'arrivée...)...",
    customNoteSaveButton: "Enregistrer la note",
    customNoteTitle: "Vos Mémos & Notes Privées",
    cloudSyncTitle: "Synchronisation Cloud en temps réel",
    cloudSyncPlaceholder: "Entrez votre adresse e-mail ou code unique...",
    cloudSyncConnectButton: "Synchroniser l'appareil",
    cloudSyncStatusConnected: "Connecté et synchronisé avec le Cloud",
    biometricTitle: "Sécurité Biométrique",
    biometricScanButton: "Activer Face ID / Empreinte digitale",
    biometricSuccess: "Authentification biométrique réussie !",
    biometricEnabledLabel: "Verrouillage biométrique actif",
    biometricDesc: "Sécurisez vos notes privées et mémos de voyage avec l'authentification biométrique de votre smartphone.",
    notificationPushTitle: "Simulateur de Notifications Push",
    notificationsTitle: "Vos Notifications",
    notificationSimulateButton: "Envoyer Notification Push",
    notificationSimulatePlaceholder: "Titre de la notification...",
    notificationSimulateBodyPlaceholder: "Message de la notification...",
    pricingMonthly: "4,99 € / mois",
    premiumFeaturesList: [
      "📞 Numéros de téléphone directs en un clic",
      "✉️ Envoi automatique de mail de réservation pré-rempli",
      "🔔 Notifications push personnalisées d'activités",
      "🛠️ Accès prioritaire 24/7 au support technique",
      "🔒 Sécurisation biométrique illimitée"
    ],
    seasons: {
      Spring: "Printemps (Fleurissement & Douceur)",
      Summer: "Été (Soleil, Plages & Randonnées)",
      Autumn: "Automne (Vendanges & Forêts Dorées)",
      Winter: "Hiver (Neige, Gastronomie & Cocooning)"
    },
    categories: {
      Nature: "Grands Espaces & Nature",
      Culture: "Culture & Patrimoine",
      Gastronomy: "Gastronomie & Terroir",
      Sport: "Sport & Aventures",
      Relaxation: "Bien-être & Détente"
    },
    privacyConsent: "En cochant cette case, j'accepte le stockage crypté local et la synchronisation sécurisée conforme au RGPD.",
    emptyFavorites: "Vous n'avez pas encore d'activités favorites. Cliquez sur le cœur pour en ajouter !",
    backToTop: "Retour en haut",
    contactSupport: "Support Technique Prioritaire",
    prioritySupportBtn: "Contacter le Support Premium",
    supportSuccessMsg: "Votre demande de support prioritaire a été envoyée ! Un technicien dédié vous répondra sous 15 minutes.",
    biometricFail: "Échec de l'authentification biométrique. Veuillez réessayer.",
    biometricAuthTitle: "Authentification Biométrique",
    biometricAuthSubtitle: "Veuillez scanner votre visage ou empreinte digitale pour déverrouiller vos notes",
    cancelLabel: "Annuler",
    favoritesTab: "Favoris",
    discoverTab: "Découvrir",
    settingsTab: "Mon Compte",
    notificationsTab: "Alertes",
    freeTierLabel: "Compte Gratuit",
    premiumTierLabel: "Membre Premium",
    syncDeviceSuccess: "Appareils synchronisés avec succès !"
  },
  en: {
    appName: "Season & Soil",
    searchPlaceholder: "Enter a city, region, or address...",
    searchButton: "Search",
    geolocationButton: "Locate Me",
    geolocatingText: "Locating in progress...",
    noActivitiesText: "No activities found for this season and place. Try launching a search!",
    categoryLabel: "Category",
    periodLabel: "Ideal Period",
    priceLabel: "Indicative Price",
    bookingLabel: "Bookings & Links",
    comparisonLabel: "Comparison & Rating",
    reviewsLabel: "Google Reviews",
    phoneLabel: "Phone Number",
    emailLabel: "E-mail Address",
    directBookingLabel: "Contact to Book",
    lockedPremiumLabel: "Locked Content (Premium Only)",
    premiumUnlockTitle: "Become a Premium Member ✨",
    premiumUnlockDesc: "Unlock instant access to bookings, direct phone numbers, pre-filled auto-booking emails, custom push alerts, and 24/7 dedicated support.",
    subscribeButton: "Subscribe for €4.99 / month",
    customNotePlaceholder: "Add a personal note for this activity (booking reference, arrival time...)...",
    customNoteSaveButton: "Save Note",
    customNoteTitle: "Your Private Notes & Memos",
    cloudSyncTitle: "Real-time Cloud Synchronization",
    cloudSyncPlaceholder: "Enter your email or unique sync code...",
    cloudSyncConnectButton: "Sync Device",
    cloudSyncStatusConnected: "Connected and Synced with Cloud",
    biometricTitle: "Biometric Security",
    biometricScanButton: "Enable Face ID / Fingerprint",
    biometricSuccess: "Biometric authentication successful!",
    biometricEnabledLabel: "Biometric lock active",
    biometricDesc: "Secure your private notes and travel memos with your smartphone's built-in biometric authentication.",
    notificationPushTitle: "Push Notification Simulator",
    notificationsTitle: "Your Notifications",
    notificationSimulateButton: "Send Push Notification",
    notificationSimulatePlaceholder: "Notification title...",
    notificationSimulateBodyPlaceholder: "Notification message...",
    pricingMonthly: "€4.99 / month",
    premiumFeaturesList: [
      "📞 One-click direct phone calls",
      "✉️ Pre-filled booking email generator",
      "🔔 Personalized seasonal push alerts",
      "🛠️ 24/7 Priority technical support",
      "🔒 Secure unlimited biometric lock"
    ],
    seasons: {
      Spring: "Spring (Blooming & Mild weather)",
      Summer: "Summer (Sun, Beaches & Hiking)",
      Autumn: "Autumn (Harvests & Golden Forests)",
      Winter: "Winter (Snow, Gastronomy & Cocooning)"
    },
    categories: {
      Nature: "Great Outdoors & Nature",
      Culture: "Patrimony & Culture",
      Gastronomy: "Gastronomy & Local Produce",
      Sport: "Sports & Adventures",
      Relaxation: "Wellness & Relaxation"
    },
    privacyConsent: "By ticking this box, I accept encrypted local storage and GDPR-compliant secure synchronization.",
    emptyFavorites: "You have no favorite activities yet. Click the heart to add some!",
    backToTop: "Back to top",
    contactSupport: "Priority Technical Support",
    prioritySupportBtn: "Contact Premium Support",
    supportSuccessMsg: "Your priority support request has been sent! A dedicated technician will answer you within 15 minutes.",
    biometricFail: "Biometric authentication failed. Please try again.",
    biometricAuthTitle: "Biometric Authentication",
    biometricAuthSubtitle: "Scan your face or fingerprint to unlock your private notes",
    cancelLabel: "Cancel",
    favoritesTab: "Favorites",
    discoverTab: "Discover",
    settingsTab: "My Account",
    notificationsTab: "Alerts",
    freeTierLabel: "Free Account",
    premiumTierLabel: "Premium Member",
    syncDeviceSuccess: "Devices synced successfully!"
  },
  de: {
    appName: "Saison & Heimat",
    searchPlaceholder: "Geben Sie eine Stadt, Region oder Adresse ein...",
    searchButton: "Suchen",
    geolocationButton: "Mich orten",
    geolocatingText: "Ortung läuft...",
    noActivitiesText: "Keine Aktivitäten für diese Jahreszeit und diesen Ort gefunden. Starten Sie eine Suche!",
    categoryLabel: "Kategorie",
    periodLabel: "Ideale Zeit",
    priceLabel: "Richtpreis",
    bookingLabel: "Buchungen & Links",
    comparisonLabel: "Vergleich & Bewertung",
    reviewsLabel: "Google-Bewertungen",
    phoneLabel: "Telefonnummer",
    emailLabel: "E-Mail-Adresse",
    directBookingLabel: "Direkt buchen",
    lockedPremiumLabel: "Gesperrter Inhalt (Nur Premium)",
    premiumUnlockTitle: "Werden Sie Premium-Mitglied ✨",
    premiumUnlockDesc: "Schalten Sie sofortigen Zugriff auf direkte Buchungen, Telefonnummern, vorformulierte E-Mails, personalisierte Push-Benachrichtigungen und 24/7 Support frei.",
    subscribeButton: "Abonnieren für 4,99 € / Monat",
    customNotePlaceholder: "Fügen Sie eine persönliche Notiz für diese Aktivität hinzu...",
    customNoteSaveButton: "Notiz speichern",
    customNoteTitle: "Ihre privaten Notizen & Memos",
    cloudSyncTitle: "Echtzeit-Cloud-Synchronisation",
    cloudSyncPlaceholder: "Geben Sie Ihre E-Mail oder einen einzigartigen Code ein...",
    cloudSyncConnectButton: "Gerät synchronisieren",
    cloudSyncStatusConnected: "Mit dem Cloud verbunden und synchronisiert",
    biometricTitle: "Biometrische Sicherheit",
    biometricScanButton: "Face ID / Fingerabdruck aktivieren",
    biometricSuccess: "Biometrische Authentifizierung erfolgreich!",
    biometricEnabledLabel: "Biometrische Sperre aktiv",
    biometricDesc: "Sichern Sie Ihre Notizen und Reisememos mit der integrierten biometrischen Authentifizierung Ihres Smartphones.",
    notificationPushTitle: "Push-Benachrichtigungssimulator",
    notificationsTitle: "Ihre Benachrichtigungen",
    notificationSimulateButton: "Push-Benachrichtigung senden",
    notificationSimulatePlaceholder: "Titel der Benachrichtigung...",
    notificationSimulateBodyPlaceholder: "Inhalt der Benachrichtigung...",
    pricingMonthly: "4,99 € / Monat",
    premiumFeaturesList: [
      "📞 Ein-Klick-Direktanrufe",
      "✉️ Vorformulierte E-Mails für Buchungen",
      "🔔 Personalisierte Push-Warnungen",
      "🛠️ Prioritärer 24/7 Technischer Support",
      "🔒 Unbegrenzte biometrische Sperrung"
    ],
    seasons: {
      Spring: "Frühling (Blütezeit & Milde Luft)",
      Summer: "Sommer (Sonne, Strände & Wandern)",
      Autumn: "Herbst (Weinlese & Goldene Wälder)",
      Winter: "Winter (Schnee, Genuss & Gemütlichkeit)"
    },
    categories: {
      Nature: "Natur & Landschaften",
      Culture: "Kultur & Kulturerbe",
      Gastronomy: "Gastronomie & Regionale Küche",
      Sport: "Sport & Abenteuer",
      Relaxation: "Wellness & Entspannung"
    },
    privacyConsent: "Durch Aktivieren stimmen Sie der DSGVO-konformen verschlüsselten lokalen Speicherung und Synchronisation zu.",
    emptyFavorites: "Sie haben noch keine Lieblingsaktivitäten. Klicken Sie auf das Herz, um welche hinzuzufügen!",
    backToTop: "Zurück nach oben",
    contactSupport: "Prioritärer Technischer Support",
    prioritySupportBtn: "Premium-Support kontaktieren",
    supportSuccessMsg: "Ihre Premium-Supportanfrage wurde gesendet! Ein Techniker wird sich innerhalb von 15 Minuten bei Ihnen melden.",
    biometricFail: "Biometrische Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    biometricAuthTitle: "Biometrische Authentifizierung",
    biometricAuthSubtitle: "Gesicht oder Fingerabdruck scannen, um Notizen freizugeben",
    cancelLabel: "Abbrechen",
    favoritesTab: "Favoriten",
    discoverTab: "Entdecken",
    settingsTab: "Mein Konto",
    notificationsTab: "Meldungen",
    freeTierLabel: "Kostenloses Konto",
    premiumTierLabel: "Premium-Mitglied",
    syncDeviceSuccess: "Geräte erfolgreich synchronisiert!"
  },
  it: {
    appName: "Stagione & Terra",
    searchPlaceholder: "Inserisci una città, regione o indirizzo...",
    searchButton: "Cerca",
    geolocationButton: "Geolocalizzami",
    geolocatingText: "Geolocalizzazione in corso...",
    noActivitiesText: "Nessuna attività trovata per questa stagione e luogo. Prova a fare una ricerca!",
    categoryLabel: "Categoria",
    periodLabel: "Periodo ideale",
    priceLabel: "Prezzo indicativo",
    bookingLabel: "Prenotazioni & Link",
    comparisonLabel: "Confronto & Valutazione",
    reviewsLabel: "Recensioni Google",
    phoneLabel: "Numero di telefono",
    emailLabel: "Indirizzo e-mail",
    directBookingLabel: "Contatta per prenotare",
    lockedPremiumLabel: "Contenuto bloccato (Solo Premium)",
    premiumUnlockTitle: "Diventa Membro Premium ✨",
    premiumUnlockDesc: "Sblocca l'accesso istantaneo alle prenotazioni, ai numeri di telefono diretti, alle e-mail di registrazione automatica, alle notifiche push e al supporto dedicato 24/7.",
    subscribeButton: "Abbonati per €4.99 / mese",
    customNotePlaceholder: "Aggiungi una nota personale per questa attività...",
    customNoteSaveButton: "Salva nota",
    customNoteTitle: "Le tue note e promemoria privati",
    cloudSyncTitle: "Sincronizzazione Cloud in tempo reale",
    cloudSyncPlaceholder: "Inserisci la tua email o codice unico...",
    cloudSyncConnectButton: "Sincronizza dispositivo",
    cloudSyncStatusConnected: "Connesso e sincronizzato con il Cloud",
    biometricTitle: "Sicurezza Biometrica",
    biometricScanButton: "Attiva Face ID / Impronta digitale",
    biometricSuccess: "Autenticazione biometrica riuscita!",
    biometricEnabledLabel: "Blocco biometrico attivo",
    biometricDesc: "Proteggi le tue note e i tuoi promemoria di viaggio con l'autenticazione biometrica del tuo smartphone.",
    notificationPushTitle: "Simulatore di Notifiche Push",
    notificationsTitle: "Le tue Notifiche",
    notificationSimulateButton: "Invia Notifica Push",
    notificationSimulatePlaceholder: "Titolo della notifica...",
    notificationSimulateBodyPlaceholder: "Testo della notifica...",
    pricingMonthly: "4,99 € / mese",
    premiumFeaturesList: [
      "📞 Chiamate dirette in un clic",
      "✉️ Email di prenotazione pre-compilata",
      "🔔 Avvisi push stagionali personalizzati",
      "🛠️ Supporto tecnico prioritario 24/7",
      "🔒 Blocco biometrico sicuro illimitato"
    ],
    seasons: {
      Spring: "Primavera (Fioritura & Clima mite)",
      Summer: "Estate (Sole, Spiagge & Trekking)",
      Autumn: "Autunno (Vendemmia & Foreste Dorate)",
      Winter: "Inverno (Neve, Gastronomia & Relax)"
    },
    categories: {
      Nature: "Grandi Spazi & Natura",
      Culture: "Cultura & Patrimonio",
      Gastronomy: "Gastronomia & Territorio",
      Sport: "Sport & Avventure",
      Relaxation: "Benessere & Relax"
    },
    privacyConsent: "Selezionando questa casella, accetto l'archiviazione locale crittografata e la sincronizzazione sicura in conformità con il GDPR.",
    emptyFavorites: "Non hai ancora attività preferite. Clicca sul cuore per aggiungerle!",
    backToTop: "Torna su",
    contactSupport: "Supporto Tecnico Prioritario",
    prioritySupportBtn: "Contatta il Supporto Premium",
    supportSuccessMsg: "La tua richiesta di supporto prioritario è stata inviata! Un tecnico dedicato ti risponderà entro 15 minuti.",
    biometricFail: "Autenticazione biometrica fallita. Riprova.",
    biometricAuthTitle: "Autenticazione Biometrica",
    biometricAuthSubtitle: "Scansiona il viso o l'impronta digitale per sbloccare le note",
    cancelLabel: "Annulla",
    favoritesTab: "Preferiti",
    discoverTab: "Scopri",
    settingsTab: "Il mio account",
    notificationsTab: "Avvisi",
    freeTierLabel: "Account Gratuito",
    premiumTierLabel: "Membro Premium",
    syncDeviceSuccess: "Dispositivi sincronizzati con successo!"
  },
  es: {
    appName: "Sazón & Suelo",
    searchPlaceholder: "Ingrese una ciudad, región o dirección...",
    searchButton: "Buscar",
    geolocationButton: "Geolocalizarme",
    geolocatingText: "Geolocalización en curso...",
    noActivitiesText: "No se encontraron actividades para esta estación y lugar. ¡Intente lanzar una búsqueda!",
    categoryLabel: "Categoría",
    periodLabel: "Período ideal",
    priceLabel: "Precio orientativo",
    bookingLabel: "Reservas & Enlaces",
    comparisonLabel: "Comparación & Evaluación",
    reviewsLabel: "Opiniones de Google",
    phoneLabel: "Número de teléfono",
    emailLabel: "Dirección de correo electrónico",
    directBookingLabel: "Contactar para reservar",
    lockedPremiumLabel: "Contenido bloqueado (Solo Premium)",
    premiumUnlockTitle: "Conviértase en Miembro Premium ✨",
    premiumUnlockDesc: "Desbloquee acceso instantáneo a reservas, números de teléfono directos, correos de inscripción pre-completados, notificaciones push personalizadas y soporte prioritario 24/7.",
    subscribeButton: "Suscribirse por 4,99 € / mes",
    customNotePlaceholder: "Añada una nota personal para esta actividad...",
    customNoteSaveButton: "Guardar nota",
    customNoteTitle: "Sus notas y notas privadas",
    cloudSyncTitle: "Sincronización Cloud en tiempo real",
    cloudSyncPlaceholder: "Ingrese su correo o código único...",
    cloudSyncConnectButton: "Sincronizar dispositivo",
    cloudSyncStatusConnected: "Conectado y sincronizado con la nube",
    biometricTitle: "Seguridad Biométrica",
    biometricScanButton: "Activar Face ID / Huella dactilar",
    biometricSuccess: "¡Autenticación biométrica exitosa!",
    biometricEnabledLabel: "Bloqueo biométrico activo",
    biometricDesc: "Asegure sus notas privadas y notas de viaje con la autenticación biométrica incorporada de su teléfono inteligente.",
    notificationPushTitle: "Simulador de Notificaciones Push",
    notificationsTitle: "Sus Notificaciones",
    notificationSimulateButton: "Enviar Notificación Push",
    notificationSimulatePlaceholder: "Título de la notificación...",
    notificationSimulateBodyPlaceholder: "Cuerpo de la notificación...",
    pricingMonthly: "4,99 € / mes",
    premiumFeaturesList: [
      "📞 Llamadas directas en un clic",
      "✉️ Generador de correos de reserva pre-completados",
      "🔔 Alertas push estacionales personalizadas",
      "🛠️ Soporte técnico prioritario 24/7",
      "🔒 Bloqueo biométrico seguro ilimitado"
    ],
    seasons: {
      Spring: "Primavera (Floración & Clima templado)",
      Summer: "Verano (Sol, Playas & Senderismo)",
      Autumn: "Otoño (Vendimia & Bosques Dorados)",
      Winter: "Invierno (Nieve, Gastronomía & Bienestar)"
    },
    categories: {
      Nature: "Naturaleza & Espacios Abiertos",
      Culture: "Cultura & Patrimonio",
      Gastronomy: "Gastronomía & Productos Locales",
      Sport: "Deportes & Aventuras",
      Relaxation: "Bienestar & Relajación"
    },
    privacyConsent: "Al marcar esta casilla, acepto el almacenamiento local cifrado y la sincronización segura conforme al RGPD.",
    emptyFavorites: "Aún no tiene actividades favoritas. ¡Haga clic en el corazón para añadirlas!",
    backToTop: "Volver arriba",
    contactSupport: "Soporte Técnico Prioritario",
    prioritySupportBtn: "Contactar al Soporte Premium",
    supportSuccessMsg: "¡Su solicitud de soporte prioritario ha sido enviada! Un técnico dedicado le responderá en 15 minutos.",
    biometricFail: "La autenticación biométrica falló. Por favor intente de nuevo.",
    biometricAuthTitle: "Autenticación Biométrica",
    biometricAuthSubtitle: "Escanee su rostro o huella dactilar para desbloquear notas",
    cancelLabel: "Cancelar",
    favoritesTab: "Favoritos",
    discoverTab: "Descubrir",
    settingsTab: "Mi Cuenta",
    notificationsTab: "Alertas",
    freeTierLabel: "Cuenta Gratuita",
    premiumTierLabel: "Miembro Premium",
    syncDeviceSuccess: "¡Dispositivos sincronizados con éxito!"
  }
};

// ── Libellés liés aux données réelles OpenStreetMap ───────────────────

export interface DataLabels {
  loadingActivities: string;
  locating: string;
  resultsCount: (n: number) => string;
  noResults: string;
  offline: string;
  placeNotFound: string;
  feeLabel: string;
  feeFree: string;
  feePaid: string;
  feeUnknown: string;
  feeOnSite: string;
  feeAll: string;
  openingHours: string;
  address: string;
  officialWebsite: string;
  viewReviews: string;
  viewOnMap: string;
  source: string;
  sourceNote: string;
  distanceFrom: string;
  page: (cur: number, total: number) => string;
  prev: string;
  next: string;
  retry: string;
  seasonSortNote: string;
  serviceBusy: string;
  cachedNote: (date: string) => string;
  localInfoTitle: (place: string) => string;
  tourismOffice: string;
  localEvents: string;
  localNews: string;
}

export const DATA_LABELS: { [key in Language]: DataLabels } = {
  fr: {
    loadingActivities: "Recherche des activités réelles autour de ce point...",
    locating: "Localisation précise en cours...",
    resultsCount: (n) => `${n} activité${n > 1 ? "s" : ""} trouvée${n > 1 ? "s" : ""}`,
    noResults: "Aucune activité répertoriée dans ce rayon. Essayez d'élargir la recherche.",
    offline: "Pas de connexion. Les activités sont chargées en direct depuis OpenStreetMap : reconnectez-vous pour les afficher.",
    placeNotFound: "Lieu introuvable. Vérifiez l'orthographe de la ville ou du code postal.",
    feeLabel: "Tarif",
    feeFree: "Gratuit",
    feePaid: "Payant",
    feeUnknown: "Tarif non renseigné",
    feeOnSite: "Tarif sur le site officiel",
    feeAll: "Tous",
    openingHours: "Horaires",
    address: "Adresse",
    officialWebsite: "Site officiel",
    viewReviews: "Voir les avis sur Google Maps",
    viewOnMap: "Voir sur la carte",
    source: "Source",
    sourceNote: "Données issues d'OpenStreetMap. Les informations non renseignées par OSM ne sont pas affichées.",
    distanceFrom: "de votre point de recherche",
    page: (cur, total) => `Page ${cur} sur ${total}`,
    prev: "Précédent",
    next: "Suivant",
    retry: "Réessayer",
    seasonSortNote: "La saison ordonne les suggestions ; elle ne filtre pas les lieux.",
    serviceBusy: "Le service OpenStreetMap est momentanément saturé. Votre connexion fonctionne : réessayez dans un instant.",
    cachedNote: (date) => `Résultats enregistrés le ${date}. Le service est momentanément indisponible.`,
    localInfoTitle: (place) => `S'informer sur ${place}`,
    tourismOffice: "Office de tourisme",
    localEvents: "Événements et agenda",
    localNews: "Actualités locales"
  },
  en: {
    loadingActivities: "Searching for real activities around this point...",
    locating: "Getting your precise location...",
    resultsCount: (n) => `${n} activit${n > 1 ? "ies" : "y"} found`,
    noResults: "No activity listed within this radius. Try widening the search.",
    offline: "No connection. Activities are loaded live from OpenStreetMap: reconnect to display them.",
    placeNotFound: "Place not found. Check the spelling of the city or postcode.",
    feeLabel: "Fee",
    feeFree: "Free",
    feePaid: "Paid",
    feeUnknown: "Fee not specified",
    feeOnSite: "Fee on official site",
    feeAll: "All",
    openingHours: "Opening hours",
    address: "Address",
    officialWebsite: "Official website",
    viewReviews: "See reviews on Google Maps",
    viewOnMap: "Show on map",
    source: "Source",
    sourceNote: "Data from OpenStreetMap. Information not provided by OSM is not displayed.",
    distanceFrom: "from your search point",
    page: (cur, total) => `Page ${cur} of ${total}`,
    prev: "Previous",
    next: "Next",
    retry: "Retry",
    seasonSortNote: "The season orders the suggestions; it does not filter places.",
    serviceBusy: "The OpenStreetMap service is momentarily overloaded. Your connection is fine: please try again shortly.",
    cachedNote: (date) => `Results saved on ${date}. The service is momentarily unavailable.`,
    localInfoTitle: (place) => `Local information: ${place}`,
    tourismOffice: "Tourist office",
    localEvents: "Events and agenda",
    localNews: "Local news"
  },
  de: {
    loadingActivities: "Suche nach echten Aktivitäten in der Umgebung...",
    locating: "Genaue Position wird ermittelt...",
    resultsCount: (n) => `${n} Aktivität${n > 1 ? "en" : ""} gefunden`,
    noResults: "Keine Aktivität in diesem Umkreis erfasst. Erweitern Sie die Suche.",
    offline: "Keine Verbindung. Aktivitäten werden live von OpenStreetMap geladen: bitte erneut verbinden.",
    placeNotFound: "Ort nicht gefunden. Prüfen Sie die Schreibweise oder die Postleitzahl.",
    feeLabel: "Preis",
    feeFree: "Kostenlos",
    feePaid: "Kostenpflichtig",
    feeUnknown: "Preis nicht angegeben",
    feeOnSite: "Preis auf der offiziellen Website",
    feeAll: "Alle",
    openingHours: "Öffnungszeiten",
    address: "Adresse",
    officialWebsite: "Offizielle Website",
    viewReviews: "Bewertungen auf Google Maps ansehen",
    viewOnMap: "Auf der Karte zeigen",
    source: "Quelle",
    sourceNote: "Daten von OpenStreetMap. Nicht erfasste Angaben werden nicht angezeigt.",
    distanceFrom: "von Ihrem Suchpunkt",
    page: (cur, total) => `Seite ${cur} von ${total}`,
    prev: "Zurück",
    next: "Weiter",
    retry: "Erneut versuchen",
    seasonSortNote: "Die Jahreszeit ordnet die Vorschläge; sie filtert die Orte nicht.",
    serviceBusy: "Der OpenStreetMap-Dienst ist derzeit überlastet. Ihre Verbindung ist in Ordnung: bitte gleich erneut versuchen.",
    cachedNote: (date) => `Am ${date} gespeicherte Ergebnisse. Der Dienst ist derzeit nicht verfügbar.`,
    localInfoTitle: (place) => `Informationen zu ${place}`,
    tourismOffice: "Touristeninformation",
    localEvents: "Veranstaltungen",
    localNews: "Lokale Nachrichten"
  },
  it: {
    loadingActivities: "Ricerca di attività reali intorno a questo punto...",
    locating: "Localizzazione precisa in corso...",
    resultsCount: (n) => `${n} attività trovat${n > 1 ? "e" : "a"}`,
    noResults: "Nessuna attività registrata in questo raggio. Prova ad ampliare la ricerca.",
    offline: "Nessuna connessione. Le attività sono caricate in diretta da OpenStreetMap: riconnettiti per visualizzarle.",
    placeNotFound: "Luogo non trovato. Controlla l'ortografia della città o il codice postale.",
    feeLabel: "Tariffa",
    feeFree: "Gratuito",
    feePaid: "A pagamento",
    feeUnknown: "Tariffa non indicata",
    feeOnSite: "Tariffa sul sito ufficiale",
    feeAll: "Tutti",
    openingHours: "Orari",
    address: "Indirizzo",
    officialWebsite: "Sito ufficiale",
    viewReviews: "Vedi le recensioni su Google Maps",
    viewOnMap: "Mostra sulla mappa",
    source: "Fonte",
    sourceNote: "Dati da OpenStreetMap. Le informazioni non presenti in OSM non vengono mostrate.",
    distanceFrom: "dal tuo punto di ricerca",
    page: (cur, total) => `Pagina ${cur} di ${total}`,
    prev: "Precedente",
    next: "Successivo",
    retry: "Riprova",
    seasonSortNote: "La stagione ordina i suggerimenti; non filtra i luoghi.",
    serviceBusy: "Il servizio OpenStreetMap è momentaneamente sovraccarico. La connessione funziona: riprova tra poco.",
    cachedNote: (date) => `Risultati salvati il ${date}. Il servizio è momentaneamente non disponibile.`,
    localInfoTitle: (place) => `Informazioni su ${place}`,
    tourismOffice: "Ufficio del turismo",
    localEvents: "Eventi e agenda",
    localNews: "Notizie locali"
  },
  es: {
    loadingActivities: "Buscando actividades reales alrededor de este punto...",
    locating: "Obteniendo su ubicación precisa...",
    resultsCount: (n) => `${n} actividad${n > 1 ? "es" : ""} encontrada${n > 1 ? "s" : ""}`,
    noResults: "Ninguna actividad registrada en este radio. Pruebe a ampliar la búsqueda.",
    offline: "Sin conexión. Las actividades se cargan en directo desde OpenStreetMap: vuelva a conectarse.",
    placeNotFound: "Lugar no encontrado. Compruebe la ortografía de la ciudad o el código postal.",
    feeLabel: "Tarifa",
    feeFree: "Gratuito",
    feePaid: "De pago",
    feeUnknown: "Tarifa no indicada",
    feeOnSite: "Tarifa en el sitio oficial",
    feeAll: "Todos",
    openingHours: "Horario",
    address: "Dirección",
    officialWebsite: "Sitio oficial",
    viewReviews: "Ver las opiniones en Google Maps",
    viewOnMap: "Ver en el mapa",
    source: "Fuente",
    sourceNote: "Datos de OpenStreetMap. La información no indicada en OSM no se muestra.",
    distanceFrom: "de su punto de búsqueda",
    page: (cur, total) => `Página ${cur} de ${total}`,
    prev: "Anterior",
    next: "Siguiente",
    retry: "Reintentar",
    seasonSortNote: "La estación ordena las sugerencias; no filtra los lugares.",
    serviceBusy: "El servicio OpenStreetMap está momentáneamente saturado. Su conexión funciona: inténtelo de nuevo en un momento.",
    cachedNote: (date) => `Resultados guardados el ${date}. El servicio no está disponible por ahora.`,
    localInfoTitle: (place) => `Información sobre ${place}`,
    tourismOffice: "Oficina de turismo",
    localEvents: "Eventos y agenda",
    localNews: "Noticias locales"
  }
};
