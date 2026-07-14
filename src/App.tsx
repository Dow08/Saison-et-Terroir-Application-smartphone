import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Compass,
  MapPin,
  Heart,
  Bell,
  BellRing,
  User,
  Search,
  Sparkles,
  Fingerprint,
  Globe,
  Loader2,
  AlertTriangle,
  Info,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Shield,
  SmartphoneNfc,
  ChevronUp,
  SlidersHorizontal,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Trash2,
  Scale,
  FileText,
  Map,
  ExternalLink
} from "lucide-react";

import { Language, Season, Activity, ActivityCategory, PushNotification, LOCALIZATION, DATA_LABELS } from "./types";
import { getDefaultNotifications, FALLBACK_BUILD_INFO } from "./data/fallbackData";
import { geocode, reverseGeocode, NetworkError, NotFoundError } from "./services/geocoding";
import { fetchActivities as fetchOsmActivities } from "./services/overpass";
import ActivityCard from "./components/ActivityCard";
import BiometricModal from "./components/BiometricModal";
import PremiumModal from "./components/PremiumModal";
import InteractiveMap from "./components/InteractiveMap";
import NotificationCenter from "./components/NotificationCenter";
import PrivacyModal from "./components/PrivacyModal";
import OnboardingModal from "./components/OnboardingModal";
import UpdateDiagnosticsModal from "./components/UpdateDiagnosticsModal";
import { getJulyWeather, isOutdoorCategory } from "./utils/weather";
import { getCurrentCoords, geoErrorMessage } from "./utils/geo";

export default function App() {
  const weatherData = getJulyWeather();

  // Localization & Theme states
  const [lang, setLang] = useState<Language>("fr");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showDesktopLangDropdown, setShowDesktopLangDropdown] = useState<boolean>(false);
  const [showMobileLangDropdown, setShowMobileLangDropdown] = useState<boolean>(false);

  // Search & Activity states
  const [season, setSeason] = useState<Season>("Summer");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchCity, setSearchCity] = useState<string>("Biarritz");
  const [searchZip, setSearchZip] = useState<string>("");
  const [searchAddr, setSearchAddr] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("user_nickname") || "Explorateur");
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [scheduledActivities, setScheduledActivities] = useState<{ [day: number]: any[] }>(() => {
    try {
      const stored = localStorage.getItem("scheduled_activities");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [geolocating, setGeolocating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const stored = localStorage.getItem("user_coords");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // User state (localStorage only — no cloud sync in APK mode)
  const [userId, setUserId] = useState<string>(() => localStorage.getItem("user_id") || "traveler-" + Math.floor(1000 + Math.random() * 9000));
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem("is_premium") !== "false");
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => localStorage.getItem("biometric_enabled") === "true");
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const s = localStorage.getItem("favorites"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [customNotes, setCustomNotes] = useState<{ [activityId: string]: string }>(() => {
    try { const s = localStorage.getItem("custom_notes"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => {
    try { const s = localStorage.getItem("push_notifications"); return s ? JSON.parse(s) : getDefaultNotifications(); } catch { return getDefaultNotifications(); }
  });

  // Navigation tab: "discover" | "favorites" | "agenda" | "notifications" | "settings" | "legal" | "rgpd"
  const [activeTab, setActiveTab] = useState<"discover" | "favorites" | "agenda" | "notifications" | "settings" | "legal" | "rgpd">("discover");

  // Dialog & Flow states
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState<boolean>(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [pendingNoteActivityId, setPendingNoteActivityId] = useState<string | null>(null);
  const [pushAlertBanner, setPushAlertBanner] = useState<PushNotification | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => !localStorage.getItem("onboarding_completed"));
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState<boolean>(false);

  // Sync Input field
  const [syncCodeField, setSyncCodeField] = useState<string>("");
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Filtrage : uniquement sur des donnees reellement fournies par OSM.
  const [feeFilter, setFeeFilter] = useState<"all" | "free" | "paid">("all");
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | "all">("all");

  // Pagination des activites (les resultats reels peuvent etre nombreux).
  const [activityPage, setActivityPage] = useState<number>(1);
  const PER_PAGE = 8;

  // Point de recherche courant : position GPS ou lieu geocode.
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);

  // Tech support priority ticket states
  const [supportText, setSupportText] = useState("");
  const [supportSuccess, setSupportSuccess] = useState(false);

  const t = LOCALIZATION[lang];
  const d = DATA_LABELS[lang];
  const listTopRef = useRef<HTMLDivElement>(null);

  // Effect: Native dark mode toggle helper on HTML node
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (darkMode) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }
  }, [darkMode]);

  // Au demarrage : localiser precisement l'utilisateur, puis charger les
  // activites reelles autour de lui. Aucune donnee de secours n'est affichee.
  useEffect(() => {
    if (!localStorage.getItem("onboarding_completed")) return;
    locateAndLoad();
  }, []);

  const handleOnboardingClose = (nickname: string, coords: { lat: number; lng: number } | null) => {
    localStorage.setItem("onboarding_completed", "true");
    setUserName(nickname);
    localStorage.setItem("user_nickname", nickname);
    setOnboardingOpen(false);
    if (coords) {
      setUserCoords(coords);
      localStorage.setItem("user_coords", JSON.stringify(coords));
      loadActivitiesAt(coords.lat, coords.lng, null);
    } else {
      locateAndLoad();
    }
  };

  // Local storage sync helpers (no cloud backend in APK mode)
  const syncSaveCloudData = (updates: {
    favorites?: string[];
    isPremium?: boolean;
    biometricEnabled?: boolean;
    pushNotifications?: PushNotification[];
    customNotes?: { [activityId: string]: string };
  }) => {
    try {
      if (updates.favorites !== undefined) localStorage.setItem("favorites", JSON.stringify(updates.favorites));
      if (updates.isPremium !== undefined) localStorage.setItem("is_premium", String(updates.isPremium));
      if (updates.biometricEnabled !== undefined) localStorage.setItem("biometric_enabled", String(updates.biometricEnabled));
      if (updates.pushNotifications !== undefined) localStorage.setItem("push_notifications", JSON.stringify(updates.pushNotifications));
      if (updates.customNotes !== undefined) localStorage.setItem("custom_notes", JSON.stringify(updates.customNotes));
    } catch (e) {
      console.error("Local storage save error:", e);
    }
  };

  /**
   * Charge les activites REELLES autour d'un point, depuis OpenStreetMap.
   * En cas d'echec, on affiche l'erreur : jamais de donnee de substitution.
   *
   * @param label nom du lieu deja connu, sinon il est resolu par geocodage inverse
   */
  const loadActivitiesAt = async (lat: number, lng: number, label: string | null) => {
    setLoading(true);
    setErrorMsg(null);
    setActivityPage(1);

    let placeLabel = label;

    try {
      if (!placeLabel) {
        try {
          placeLabel = (await reverseGeocode(lat, lng, lang)).label;
        } catch {
          // Le nom du lieu est un confort, pas une condition : on continue sans.
          placeLabel = null;
        }
      }

      const center = { lat, lng, label: placeLabel ?? "" };
      setSearchCenter(center);
      setResolvedCoords({ lat, lng });
      if (placeLabel) setSearchQuery(placeLabel);

      const { activities: found } = await fetchOsmActivities(lat, lng, searchRadius, lang);
      setActivities(found);
    } catch (err) {
      setActivities([]);
      if (err instanceof NetworkError || !navigator.onLine) {
        setErrorMsg(d.offline);
      } else {
        setErrorMsg(err instanceof Error ? err.message : d.noResults);
      }
    } finally {
      setLoading(false);
    }
  };

  /** Geolocalise precisement puis charge les activites autour de la position. */
  const locateAndLoad = async () => {
    setGeolocating(true);
    setErrorMsg(null);
    try {
      const coords = await getCurrentCoords();
      setUserCoords(coords);
      localStorage.setItem("user_coords", JSON.stringify(coords));
      setSearchCity("");
      setSearchZip("");
      setSearchAddr("");
      await loadActivitiesAt(coords.lat, coords.lng, null);
    } catch (error) {
      console.error("Geolocation error:", error);
      setErrorMsg(geoErrorMessage(error, lang));
    } finally {
      setGeolocating(false);
    }
  };

  const handleGeolocation = () => {
    void locateAndLoad();
  };

  /**
   * Recherche d'un autre lieu (ville, code postal, adresse).
   * La saisie est convertie en coordonnees reelles par geocodage, puis les
   * activites de CE lieu sont chargees : la carte et la liste suivent.
   */
  const handleSearchPlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const query = [searchAddr, searchCity, searchZip]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    if (!query) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      // La position connue sert de biais : sans elle, une saisie comme "31000"
      // peut renvoyer un homonyme a l'autre bout du monde.
      const place = await geocode(query, lang, userCoords);
      await loadActivitiesAt(place.lat, place.lng, place.label);
    } catch (err) {
      setActivities([]);
      setLoading(false);
      if (err instanceof NotFoundError) {
        setErrorMsg(d.placeNotFound);
      } else if (err instanceof NetworkError || !navigator.onLine) {
        setErrorMsg(d.offline);
      } else {
        setErrorMsg(err instanceof Error ? err.message : d.placeNotFound);
      }
    }
  };

  /** Relance la recherche sur le point courant (changement de rayon, de langue). */
  const reloadCurrent = () => {
    if (searchCenter) {
      void loadActivitiesAt(searchCenter.lat, searchCenter.lng, searchCenter.label || null);
    } else if (userCoords) {
      void loadActivitiesAt(userCoords.lat, userCoords.lng, null);
    } else {
      void locateAndLoad();
    }
  };

  // Toggle favorite trigger
  const handleToggleFavorite = (actId: string) => {
    let updated: string[];
    if (favorites.includes(actId)) {
      updated = favorites.filter((id) => id !== actId);
    } else {
      updated = [...favorites, actId];
    }
    setFavorites(updated);
    syncSaveCloudData({ favorites: updated });
  };

  // Save private note memo
  const handleSaveNote = (actId: string, note: string) => {
    const updated = { ...customNotes, [actId]: note };
    setCustomNotes(updated);
    syncSaveCloudData({ customNotes: updated });
  };

  // Trigger Biometric Verification scanner modal
  const handleTriggerBiometric = (actId: string) => {
    setPendingNoteActivityId(actId);
    setBiometricModalOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricAuthenticated(true);
    setPendingNoteActivityId(null);
  };

  // Push notification simulator (local only — no server)
  const handleSimulateNotification = (title: string, body: string, category: string) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: title || "Notification !",
      body: body || "Ceci est un test de notification push.",
      timestamp: new Date().toISOString(),
      category: category || "promo",
      read: false
    };
    const updated = [newNotif, ...pushNotifications];
    setPushNotifications(updated);
    syncSaveCloudData({ pushNotifications: updated });
    setPushAlertBanner(newNotif);
    setTimeout(() => {
      setPushAlertBanner(null);
    }, 4500);
  };

  const handleClearNotifications = () => {
    setPushNotifications([]);
    syncSaveCloudData({ pushNotifications: [] });
  };

  const handleMarkAllRead = () => {
    const updated = pushNotifications.map((n) => ({ ...n, read: true }));
    setPushNotifications(updated);
    syncSaveCloudData({ pushNotifications: updated });
  };

  // Multi-device Cloud synchronization logic
  const handleConnectCloudSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncCodeField.trim()) return;

    const targetUid = syncCodeField.trim().toLowerCase();
    setUserId(targetUid);
    setSyncStatusMsg("Connexion en cours...");

    // Les donnees sont conservees localement : il n'y a pas de serveur a
    // interroger ici, seul l'identifiant de synchronisation est mis a jour.
    setTimeout(() => {
      setSyncStatusMsg(t.syncDeviceSuccess);
      setSyncCodeField("");
      setTimeout(() => setSyncStatusMsg(null), 3000);
    }, 1200);
  };

  // Support prioritair email submit
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    setSupportSuccess(true);
    setSupportText("");
    setTimeout(() => setSupportSuccess(false), 4000);
  };

  // Toggle dynamic premium tier simulated purchase
  const handleUpgradeSuccess = () => {
    setIsPremium(true);
    syncSaveCloudData({ isPremium: true });

    // Send a welcome push alert!
    setTimeout(() => {
      handleSimulateNotification(
        lang === "fr" ? "Abonnement Activé ! 👑" : "Subscription Activated! 👑",
        lang === "fr"
          ? "Félicitations, vous bénéficiez désormais de l'expérience Saison & Terroir illimitée."
          : "Congratulations! You now have unlimited access to Season & Soil Premium features.",
        "system"
      );
    }, 500);
  };

  const handleScheduleActivity = (act: any, day: number) => {
    const updated = { ...scheduledActivities };
    if (!updated[day]) {
      updated[day] = [];
    }
    if (!updated[day].some((existing: any) => existing.id === act.id)) {
      updated[day] = [...updated[day], act];
      setScheduledActivities(updated);
      localStorage.setItem("scheduled_activities", JSON.stringify(updated));
      
      // Send dynamic feedback push alert
      handleSimulateNotification(
        lang === "fr" ? "Activité Planifiée ! 📅" : "Activity Scheduled! 📅",
        lang === "fr"
          ? `"${act.name}" a été planifiée pour le ${day} Juillet 2026. Réduction Partenaire active !`
          : `"${act.name}" has been scheduled for July ${day}, 2026. Partner discount code active!`,
        "system"
      );
    }
  };

  const handleUnscheduleActivity = (day: number, actId: string) => {
    const updated = { ...scheduledActivities };
    if (updated[day]) {
      updated[day] = updated[day].filter((act: any) => act.id !== actId);
      if (updated[day].length === 0) {
        delete updated[day];
      }
      setScheduledActivities(updated);
      localStorage.setItem("scheduled_activities", JSON.stringify(updated));
    }
  };

  // Pin selection from vector map highlights/scrolls to card
  const handleSelectActivityFromMap = (id: string) => {
    setSelectedActivityId(id);
    const element = document.getElementById(`activity-card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Helper: Extract clean city name from searchQuery or fallback to searchCity
  const getCleanLocalCity = (fullQuery: string, fallbackField: string) => {
    if (fallbackField && fallbackField.trim()) {
      return fallbackField.trim();
    }
    if (!fullQuery) return "Occitanie";
    const firstSegment = fullQuery.split(",")[0].trim();
    return firstSegment || "Occitanie";
  };

  // Client-side advanced filter resolver
  // Filtres appliques uniquement sur des donnees reellement fournies par OSM.
  const filteredActivities = activities.filter((act) => {
    if (feeFilter === "free" && act.fee !== "free") return false;
    if (feeFilter === "paid" && act.fee !== "paid") return false;
    if (categoryFilter !== "all" && act.category !== categoryFilter) return false;
    return true;
  });

  /**
   * La saison ne filtre pas les lieux : OSM ne connait pas leur saisonnalite.
   * Elle ordonne seulement les suggestions, en remontant les categories
   * pertinentes (exterieur en ete, interieur en hiver). Les distances, elles,
   * restent la cle de tri principale au sein d'une meme categorie.
   */
  const SEASON_PRIORITY: Record<Season, ActivityCategory[]> = {
    Spring: ["Nature", "Culture", "Gastronomy", "Sport", "Relaxation"],
    Summer: ["Nature", "Sport", "Gastronomy", "Culture", "Relaxation"],
    Autumn: ["Gastronomy", "Culture", "Nature", "Relaxation", "Sport"],
    Winter: ["Culture", "Relaxation", "Gastronomy", "Sport", "Nature"],
  };

  const displayedActivities = [...filteredActivities].sort((a, b) => {
    const order = SEASON_PRIORITY[season];
    const rank = order.indexOf(a.category) - order.indexOf(b.category);
    if (rank !== 0) return rank;
    return a.distanceKm - b.distanceKm;
  });

  const totalPages = Math.max(1, Math.ceil(displayedActivities.length / PER_PAGE));
  const currentPage = Math.min(activityPage, totalPages);
  const pagedActivities = displayedActivities.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  // Local calendar synchronization via standards-compliant ICS download
  const handleExportToDeviceCalendar = (day: number) => {
    const dayEvents = scheduledActivities[day];
    if (!dayEvents || dayEvents.length === 0) return;

    const pad = (num: number) => String(num).padStart(2, "0");
    const dayStr = pad(day);

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Saison & Terroir//NONSGML Calendar Sync//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ].join("\r\n");

    dayEvents.forEach((act: any, index: number) => {
      const eventUid = `event-202607${dayStr}-${index}@saisonterroir.app`;
      // Scheduled hours: 10:00 to 12:00 UTC
      const dtStart = `202607${dayStr}T100000Z`;
      const dtEnd = `202607${dayStr}T120000Z`;
      const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsContent += [
        "\r\nBEGIN:VEVENT",
        `UID:${eventUid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${act.name.replace(/[,;]/g, "\\$&")}`,
        `DESCRIPTION:${(lang === "fr" ? "Activité programmée via l'application Saison & Terroir. Code réduction de -15% actif : TERROIR15." : "Activity scheduled via Season & Soil app. -15% partner discount code active: TERROIR15.").replace(/[,;]/g, "\\$&")}`,
        `LOCATION:${(act.price + " • " + act.city).replace(/[,;]/g, "\\$&")}`,
        "END:VEVENT"
      ].join("\r\n");
    });

    icsContent += "\r\nEND:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agenda-saison-terroir-juillet-${dayStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Simulate push alert confirm
    handleSimulateNotification(
      lang === "fr" ? "Agenda Synchronisé ! 📱" : "Calendar Synced! 📱",
      lang === "fr"
        ? `L'agenda du ${day} Juillet a été exporté vers le stockage local de votre téléphone. Ouvrez le fichier .ics pour l'ajouter à votre agenda natif (Google Calendar, iCal).`
        : `July ${day} calendar exported to your local storage. Open the .ics file to automatically sync with your device calendar.`,
      "system"
    );
  };

  // Export all scheduled activities across the entire month of July 2026
  const handleExportEntireCalendar = () => {
    const pad = (num: number) => String(num).padStart(2, "0");
    let hasEvents = false;

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Saison & Terroir//NONSGML Calendar Sync//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ].join("\r\n");

    (Object.entries(scheduledActivities) as [string, any[]][]).forEach(([dayKey, dayEvents]) => {
      const day = parseInt(dayKey, 10);
      if (isNaN(day) || !dayEvents || dayEvents.length === 0) return;
      hasEvents = true;
      const dayStr = pad(day);

      dayEvents.forEach((act: any, index: number) => {
        const eventUid = `event-202607${dayStr}-${index}-${act.id}@saisonterroir.app`;
        const dtStart = `202607${dayStr}T100000Z`;
        const dtEnd = `202607${dayStr}T120000Z`;
        const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        icsContent += [
          "\r\nBEGIN:VEVENT",
          `UID:${eventUid}`,
          `DTSTAMP:${dtStamp}`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:${act.name.replace(/[,;]/g, "\\$&")}`,
          `DESCRIPTION:${(lang === "fr" ? "Activité programmée via l'application Saison & Terroir. Code réduction de -15% actif : TERROIR15." : "Activity scheduled via Season & Soil app. -15% partner discount code active: TERROIR15.").replace(/[,;]/g, "\\$&")}`,
          `LOCATION:${(act.price + " • " + act.city).replace(/[,;]/g, "\\$&")}`,
          "END:VEVENT"
        ].join("\r\n");
      });
    });

    if (!hasEvents) return;

    icsContent += "\r\nEND:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "programme-saison-terroir.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleSimulateNotification(
      lang === "fr" ? "Programme Complet Exporté ! 📅" : "Full Program Exported! 📅",
      lang === "fr"
        ? `L'intégralité de votre programme fabriqué a été exportée. Ouvrez le fichier .ics pour l'ajouter à l'agenda de votre téléphone.`
        : `Your entire planned travel program has been exported. Open the .ics file to sync all days with your device calendar.`,
      "system"
    );
  };

  const filteredFavoriteActivities = activities.filter((act) => favorites.includes(act.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex flex-col md:py-8 md:px-4 items-center justify-center transition-colors duration-200 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Device or desktop full wrapper of Sophisticated Dark */}
      <div className="w-full max-w-6xl md:h-[860px] md:rounded-[36px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#050505] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Modern High-End Sidebar Menu (Visible on Desktop / PC layout) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-[#0d0d0d] border-r border-slate-150 dark:border-white/10 p-5 shrink-0 justify-between h-full overflow-hidden">
          <div className="space-y-4 flex flex-col h-[85%] overflow-y-auto custom-scrollbar pr-1">
            {/* Logo area */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 bg-amber-500 rounded-xl text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-serif italic text-slate-900 dark:text-white leading-tight">Saison & Terroir</h1>
                <span className="text-[9px] text-amber-500 uppercase font-bold tracking-[0.15em]">L'authenticité locale</span>
              </div>
            </div>

            {/* Nav tabs list */}
            <nav className="space-y-1 pt-1 shrink-0">
              <button
                onClick={() => setActiveTab("discover")}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-350 ${
                  activeTab === "discover"
                    ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{t.discoverTab}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("favorites")}
                className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-350 ${
                  activeTab === "favorites"
                    ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span>{t.favoritesTab}</span>
                </div>
                {favorites.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "favorites" ? "bg-black text-amber-500" : "bg-amber-500/10 text-amber-400"}`}>
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-350 ${
                  activeTab === "notifications"
                    ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>{t.notificationsTab}</span>
                </div>
                {pushNotifications.some((n) => !n.read) && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("settings");
                  if (biometricEnabled && !isBiometricAuthenticated) {
                    setBiometricModalOpen(true);
                  }
                }}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-[11px] uppercase tracking-wider font-bold transition-all duration-350 ${
                  activeTab === "settings"
                    ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t.settingsTab}</span>
              </button>
            </nav>



            {/* Dynamic Interactive Calendar Agenda */}
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-3.5 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
                  {lang === "fr" ? "Mon Agenda" : "My Agenda"}
                </span>
                <span className="text-[8px] font-mono text-amber-500 font-extrabold uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Juillet 2026
                </span>
              </div>

              {/* Day names row */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[7px] font-bold text-slate-500">
                <span>{lang === "fr" ? "LU" : "MO"}</span>
                <span>{lang === "fr" ? "MA" : "TU"}</span>
                <span>{lang === "fr" ? "ME" : "WE"}</span>
                <span>{lang === "fr" ? "JE" : "TH"}</span>
                <span>{lang === "fr" ? "VE" : "FR"}</span>
                <span>{lang === "fr" ? "SA" : "SA"}</span>
                <span>{lang === "fr" ? "DI" : "SU"}</span>
              </div>

              {/* July calendar grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-[9px]">
                {/* 1st July 2026 starts on Wednesday */}
                <span />
                <span />
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hasActivities = scheduledActivities[day] && scheduledActivities[day].length > 0;
                  const isSelected = selectedDay === day;
                  const isDangerous = weatherData[day]?.isDangerousForOutdoor;
                  return (
                    <button
                      key={day}
                      id={`calendar-day-${day}`}
                      onClick={() => setSelectedDay(day)}
                      className={`h-5 w-full rounded flex flex-col items-center justify-center relative font-mono font-bold transition-all ${
                        isSelected
                          ? "bg-amber-500 text-black scale-105"
                          : isDangerous
                          ? "hover:bg-red-500/10 text-red-400 border border-red-500/20"
                          : "hover:bg-white/5 text-slate-300"
                      }`}
                      title={`${day} Juillet : ${lang === "fr" ? weatherData[day]?.labelFr : weatherData[day]?.labelEn}`}
                    >
                      <span>{day}</span>
                      {hasActivities && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${isSelected ? "bg-black" : isDangerous ? "bg-red-400" : "bg-amber-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Day scheduled activities scroll content */}
              <div className="border-t border-white/5 pt-2 max-h-32 overflow-y-auto custom-scrollbar space-y-1.5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col text-left">
                    <span className="block text-[8px] font-extrabold uppercase text-slate-500 tracking-wider">
                      {lang === "fr" ? `${selectedDay} Juillet 2026` : `July ${selectedDay}, 2026`}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{weatherData[selectedDay]?.icon}</span>
                      <span>
                        {lang === "fr" ? weatherData[selectedDay]?.labelFr : weatherData[selectedDay]?.labelEn} ({weatherData[selectedDay]?.temp}°C)
                      </span>
                    </span>
                  </div>
                  {scheduledActivities[selectedDay] && scheduledActivities[selectedDay].length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id="btn-sync-device-calendar"
                        onClick={() => handleExportToDeviceCalendar(selectedDay)}
                        className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1"
                        title={lang === "fr" ? "Exporter ce jour" : "Export this day"}
                      >
                        <Smartphone className="w-2.5 h-2.5" />
                        <span>{lang === "fr" ? "Jour" : "Day"}</span>
                      </button>
                      <button
                        id="btn-sync-all-calendar"
                        onClick={handleExportEntireCalendar}
                        className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1"
                        title={lang === "fr" ? "Exporter tout le programme" : "Export entire program"}
                      >
                        <CalendarCheck className="w-2.5 h-2.5" />
                        <span>{lang === "fr" ? "Tout" : "All"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {scheduledActivities[selectedDay] && scheduledActivities[selectedDay].length > 0 ? (
                  scheduledActivities[selectedDay].map((act: any) => {
                    const isOutdoor = isOutdoorCategory(act.category);
                    const isDangerous = weatherData[selectedDay]?.isDangerousForOutdoor;
                    return (
                      <div key={act.id} className="bg-white/[0.03] hover:bg-white/[0.06] p-2 border border-white/5 rounded-xl space-y-1 relative group/item transition-colors">
                        {isOutdoor && isDangerous && (
                          <div className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-bold mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-red-400" />
                            <span>{lang === "fr" ? "Alerte Tempête !" : "Storm Warning!"}</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between pr-3">
                          <span className="text-[10px] font-bold text-slate-200 line-clamp-1 leading-tight">{act.name}</span>
                          <button
                            onClick={() => handleUnscheduleActivity(selectedDay, act.id)}
                            className="text-slate-500 hover:text-red-500 absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            title={lang === "fr" ? "Retirer" : "Remove"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[8px] pt-1">
                          <span className="text-emerald-400 font-bold">🏷️ -15% (TERROIR15)</span>
                          <a
                            href={act.bookingUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded uppercase font-extrabold tracking-wider transition-all"
                          >
                            Réserver
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="block text-[9px] text-slate-500 italic text-center py-1">
                    {lang === "fr" ? "Aucun projet" : "No plans"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Bottom indicators */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">

            <div className="flex items-center justify-between">
              {/* Language Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowDesktopLangDropdown(!showDesktopLangDropdown)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang}</span>
                </button>
                {showDesktopLangDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowDesktopLangDropdown(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-30 overflow-hidden text-xs text-slate-700 dark:text-slate-300 min-w-[100px]">
                      {(["fr", "en", "de", "it", "es"] as Language[]).map((ln) => (
                        <button
                          key={ln}
                          onClick={() => {
                            setLang(ln);
                            setShowDesktopLangDropdown(false);
                            setTimeout(() => reloadCurrent(), 100);
                          }}
                          className={`w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors font-bold ${
                            lang === ln ? "text-amber-500 bg-amber-500/5" : ""
                          }`}
                        >
                          {ln.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Theme switcher (Native toggle status) */}
              <button
                id="theme-toggler-btn-desktop"
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg transition-colors focus:outline-hidden"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic In-App Top Push Notification Alert Banner */}
        <AnimatePresence>
          {pushAlertBanner && (
            <motion.div
              id="push-notification-banner"
              initial={{ opacity: 0, y: -70 }}
              animate={{ opacity: 1, y: 15 }}
              exit={{ opacity: 0, y: -70 }}
              className="absolute top-0 inset-x-4 md:left-68 md:right-6 z-55 p-4 bg-[#0d0d0d]/95 border border-white/15 rounded-2xl shadow-xl flex items-start gap-3.5 backdrop-blur-md cursor-pointer"
              onClick={() => {
                setActiveTab("notifications");
                setPushAlertBanner(null);
              }}
            >
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">Notification Push</span>
                  <span className="text-[9px] text-slate-500">À l'instant</span>
                </div>
                <h5 className="text-xs font-bold text-white mt-0.5">{pushAlertBanner.title}</h5>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{pushAlertBanner.body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main interactive area */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-[#050505]">
          
          {/* Header (visible only on mobile) */}
          <header className="md:hidden px-5 py-4 bg-slate-50 dark:bg-[#0d0d0d] border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 rounded-lg text-black">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-sm font-serif italic text-slate-900 dark:text-white leading-tight">Saison & Terroir</h1>
                {isPremium ? (
                  <span className="text-[8px] font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Premium
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                    Gratuit
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Language Selector (mobile) */}
              <div className="relative">
                <button
                  id="lang-toggler-btn"
                  onClick={() => setShowMobileLangDropdown(!showMobileLangDropdown)}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang}</span>
                </button>
                {showMobileLangDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowMobileLangDropdown(false)}
                    />
                    <div className="absolute right-0 mt-1 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg z-30 overflow-hidden text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[100px]">
                      {(["fr", "en", "de", "it", "es"] as Language[]).map((ln) => (
                        <button
                          key={ln}
                          onClick={() => {
                            setLang(ln);
                            setShowMobileLangDropdown(false);
                            setTimeout(() => reloadCurrent(), 100);
                          }}
                          className={`w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors ${
                            lang === ln ? "text-amber-500 bg-amber-500/5" : ""
                          }`}
                        >
                          {ln.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Theme switcher (mobile) */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg transition-colors focus:outline-hidden"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          </header>

          {/* Scrollable Body Content */}
          <main className="flex-1 overflow-y-auto p-5 pb-24 md:pb-6 space-y-6 scroll-smooth" ref={listTopRef}>
            
            {/* Tab: Discover Section */}
            {activeTab === "discover" && (
              <div className="space-y-6">
                
                {/* Brand Hero Callout (Visual rhythm & negative space) */}
                <div className="py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    {lang === "fr" ? "Explorer la région" : "Explore the region"}
                  </span>
                  <h2 className="text-xl md:text-3xl font-serif italic text-white tracking-tight mt-1 leading-tight">
                    {lang === "fr" ? (
                      <>
                        Bienvenue <span className="text-amber-500 not-italic font-sans font-black">{userName}</span>, Découvrons des activités à faire ensemble.
                      </>
                    ) : (
                      <>
                        Welcome <span className="text-amber-500 not-italic font-sans font-black">{userName}</span>, Let's discover activities to do together.
                      </>
                    )}
                  </h2>
                </div>

                {/* Search Widget Card */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                  
                  {/* Structured Search Fields (City, Postal Code, Address) */}
                  <div className="space-y-3.5 mb-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      {/* Nom de la ville */}
                      <div className="relative sm:col-span-5">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          id="search-city-input"
                          type="text"
                          required
                          placeholder={lang === "fr" ? "Nom de la ville (ex: Biarritz)" : "City name (e.g., Biarritz)"}
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleSearchPlace();
                          }}
                          className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Code postal */}
                      <div className="relative sm:col-span-3">
                        <Map className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          id="search-zip-input"
                          type="text"
                          placeholder={lang === "fr" ? "Code postal (ex: 64200)" : "Zip code (e.g., 64200)"}
                          value={searchZip}
                          onChange={(e) => setSearchZip(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleSearchPlace();
                          }}
                          className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Adresse exacte */}
                      <div className="relative sm:col-span-4">
                        <Compass className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          id="search-addr-input"
                          type="text"
                          placeholder={lang === "fr" ? "Adresse exacte" : "Exact address"}
                          value={searchAddr}
                          onChange={(e) => setSearchAddr(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleSearchPlace();
                          }}
                          className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-10 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Advanced options toggle */}
                      <button
                        id="btn-advanced-filters-toggle"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
                          showAdvancedFilters
                            ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20"
                            : "bg-[#050505] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                        title={lang === "fr" ? "Filtres avancés" : "Advanced filters"}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{lang === "fr" ? "Filtres Avancés" : "Advanced Filters"}</span>
                      </button>

                      <div className="flex-1" />

                      <button
                        id="btn-search-trigger"
                        onClick={() => void handleSearchPlace()}
                        disabled={loading}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/15 shrink-0 flex items-center gap-2"
                      >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {t.searchButton}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Advanced Filters Panel */}
                  <AnimatePresence>
                    {showAdvancedFilters && (
                      <motion.div
                        id="advanced-filters-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/5 pt-3.5 mt-3 space-y-4"
                      >
                        {/* Mileage Radius Slider */}
                        <div className="bg-[#050505] border border-white/5 rounded-xl p-3.5 space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">
                              {lang === "fr" ? "Rayon de recherche étendu" : "Expanded search radius"}
                            </span>
                            <span className="text-amber-500 font-mono">
                              {searchRadius} km
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(parseInt(e.target.value, 10))}
                            onMouseUp={() => reloadCurrent()}
                            onTouchEnd={() => reloadCurrent()}
                            className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>5 km</span>
                            <span>25 km</span>
                            <span>50 km</span>
                            <span>75 km</span>
                            <span>100 km</span>
                          </div>
                        </div>

                        {/* Filtres appuyés sur des données réellement fournies par OpenStreetMap */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          {/* Tarif : issu des tags OSM fee / charge */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {d.feeLabel}
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {([
                                ["all", d.feeAll],
                                ["free", d.feeFree],
                                ["paid", d.feePaid],
                              ] as const).map(([value, label]) => (
                                <button
                                  type="button"
                                  key={value}
                                  onClick={() => {
                                    setFeeFilter(value);
                                    setActivityPage(1);
                                  }}
                                  className={`py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                                    feeFilter === value
                                      ? "bg-amber-500 border-amber-500 text-black"
                                      : "bg-[#050505] border-white/10 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Catégorie */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {t.categoryLabel}
                            </label>
                            <select
                              value={categoryFilter}
                              onChange={(e) => {
                                setCategoryFilter(e.target.value as ActivityCategory | "all");
                                setActivityPage(1);
                              }}
                              className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-hidden"
                            >
                              <option value="all">{d.feeAll}</option>
                              {(["Nature", "Culture", "Gastronomy", "Sport", "Relaxation"] as ActivityCategory[]).map((c) => (
                                <option key={c} value={c}>
                                  {t.categories[c]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-2.5">
                          {d.sourceNote}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Geolocation & Season picker flex */}
                <div className="flex flex-col gap-3">
                  {/* Locate me button */}
                  <button
                    id="btn-locate-user"
                    onClick={handleGeolocation}
                    disabled={geolocating}
                    className="w-full py-2.5 bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 text-amber-500 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-hidden"
                  >
                    {geolocating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>{t.geolocatingText}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>{t.geolocationButton}</span>
                      </>
                    )}
                  </button>

                  {/* Season Grid Select buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {(["Spring", "Summer", "Autumn", "Winter"] as Season[]).map((s) => (
                      <button
                        key={s}
                        id={`btn-season-${s}`}
                        onClick={() => {
                          // La saison reordonne les suggestions ; elle ne
                          // change pas les lieux, inutile de recharger OSM.
                          setSeason(s);
                          setActivityPage(1);
                        }}
                        className={`py-2 px-1 rounded-lg text-[10px] font-extrabold text-center uppercase tracking-wider border transition-all ${
                          season === s
                            ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/25"
                            : "bg-[#050505] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {lang === "fr"
                          ? s === "Spring" ? "Printemps" : s === "Summer" ? "Été" : s === "Autumn" ? "Automne" : "Hiver"
                          : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error messages if any */}
              {errorMsg && (
                <div id="error-alert" className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <p className="font-semibold leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Loader feedback */}
              {loading || geolocating ? (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-xs font-semibold font-serif italic">
                    {geolocating ? d.locating : d.loadingActivities}
                  </p>
                  <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-amber-500 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
                  </div>
                </div>
              ) : errorMsg ? (
                <div className="bg-[#0d0d0d] border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">{errorMsg}</p>
                  <button
                    onClick={() => reloadCurrent()}
                    className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/20 transition-all"
                  >
                    {d.retry}
                  </button>
                </div>
              ) : (
                <>
                  {/* Interactive Map Visualizer */}
                  {displayedActivities.length > 0 && (
                    <InteractiveMap
                      activities={displayedActivities}
                      selectedActivityId={selectedActivityId}
                      onSelectActivity={handleSelectActivityFromMap}
                      centerName={searchQuery}
                      darkMode={darkMode}
                      userCoords={userCoords}
                    />
                  )}

                  {/* Activités réelles, paginées */}
                  <div className="space-y-4">
                    {displayedActivities.length === 0 ? (
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 text-center text-slate-400">
                        <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs leading-relaxed font-semibold">{d.noResults}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                          <span>{d.resultsCount(displayedActivities.length)}</span>
                          {totalPages > 1 && (
                            <span className="font-mono text-amber-500">
                              {d.page(currentPage, totalPages)}
                            </span>
                          )}
                        </div>

                        {pagedActivities.map((act) => (
                          <ActivityCard
                            key={act.id}
                            activity={act}
                            isFavorite={favorites.includes(act.id)}
                            onToggleFavorite={() => handleToggleFavorite(act.id)}
                            biometricEnabled={biometricEnabled}
                            isBiometricAuthenticated={isBiometricAuthenticated}
                            onTriggerBiometric={() => handleTriggerBiometric(act.id)}
                            lang={lang}
                            customNote={customNotes[act.id] || ""}
                            onSaveNote={(note) => handleSaveNote(act.id, note)}
                            onSchedule={(day) => handleScheduleActivity(act, day)}
                            onShowOnMap={() => handleSelectActivityFromMap(act.id)}
                          />
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setActivityPage(Math.max(1, currentPage - 1));
                                listTopRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              disabled={currentPage === 1}
                              className="px-3 py-2 rounded-xl border border-white/10 bg-[#050505] text-[11px] font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              ← {d.prev}
                            </button>

                            <span className="px-3 text-[11px] font-mono text-slate-400">
                              {currentPage} / {totalPages}
                            </span>

                            <button
                              onClick={() => {
                                setActivityPage(Math.min(totalPages, currentPage + 1));
                                listTopRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 rounded-xl border border-white/10 bg-[#050505] text-[11px] font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              {d.next} →
                            </button>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500 text-center pt-1">
                          {d.sourceNote}
                        </p>
                      </>
                    )}
                  </div>

                  {/* S'informer sur la région : liens sortants réels, placés
                      sous les activités car purement informatifs. */}
                  {searchCenter?.label && (
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">
                        {lang === "fr"
                          ? `S'informer sur ${searchCenter.label}`
                          : `Local information: ${searchCenter.label}`}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          {
                            label: lang === "fr" ? "Office de tourisme" : "Tourist office",
                            q: `office de tourisme ${searchCenter.label}`,
                          },
                          {
                            label: lang === "fr" ? "Événements et agenda" : "Events and agenda",
                            q: `agenda événements ${searchCenter.label}`,
                          },
                        ].map((item) => (
                          <a
                            key={item.label}
                            href={`https://www.google.com/search?q=${encodeURIComponent(item.q)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 bg-[#050505] hover:bg-[#0c0c0c] border border-white/5 hover:border-amber-500/20 p-3.5 rounded-xl transition-all text-xs font-bold text-slate-300"
                          >
                            <span>{item.label}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab: Favorites Section */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {t.favoritesTab} ({filteredFavoriteActivities.length})
              </h3>

              {filteredFavoriteActivities.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-2xl p-8 text-center text-gray-500">
                  <Heart className="w-8 h-8 text-red-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs leading-relaxed font-semibold">{t.emptyFavorites}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFavoriteActivities.map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      isFavorite={true}
                      onToggleFavorite={() => handleToggleFavorite(act.id)}
                      biometricEnabled={biometricEnabled}
                      isBiometricAuthenticated={isBiometricAuthenticated}
                      onTriggerBiometric={() => handleTriggerBiometric(act.id)}
                      lang={lang}
                      customNote={customNotes[act.id] || ""}
                      onSaveNote={(note) => handleSaveNote(act.id, note)}
                      onSchedule={(day) => handleScheduleActivity(act, day)}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Tab: Dynamic Fullscreen Agenda Section */}
          {activeTab === "agenda" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif italic text-white leading-tight">
                  {lang === "fr" ? "Mon Agenda Interactif" : "My Interactive Agenda"}
                </h3>
                <span className="text-[10px] font-mono text-amber-500 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Juillet 2026
                </span>
              </div>

              {/* Calendar Grid Container Card */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                {/* Day names row */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
                  <span>{lang === "fr" ? "LUN" : "MON"}</span>
                  <span>{lang === "fr" ? "MAR" : "TUE"}</span>
                  <span>{lang === "fr" ? "MER" : "WED"}</span>
                  <span>{lang === "fr" ? "JEU" : "THU"}</span>
                  <span>{lang === "fr" ? "VEN" : "FRI"}</span>
                  <span>{lang === "fr" ? "SAM" : "SAT"}</span>
                  <span>{lang === "fr" ? "DIM" : "SUN"}</span>
                </div>

                {/* July calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {/* 1st July 2026 starts on Wednesday */}
                  <span />
                  <span />
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const hasActivities = scheduledActivities[day] && scheduledActivities[day].length > 0;
                    const isSelected = selectedDay === day;
                    const isDangerous = weatherData[day]?.isDangerousForOutdoor;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`h-11 w-full rounded-xl flex flex-col items-center justify-center relative font-mono font-bold transition-all ${
                          isSelected
                            ? "bg-amber-500 text-black scale-105 shadow-md shadow-amber-500/20"
                            : isDangerous
                            ? "hover:bg-red-500/10 text-red-400 border border-red-500/20 bg-red-500/5"
                            : "bg-[#050505] hover:bg-white/5 text-slate-300 border border-white/5"
                        }`}
                        title={`${day} Juillet : ${lang === "fr" ? weatherData[day]?.labelFr : weatherData[day]?.labelEn}`}
                      >
                        <span className="text-xs">{day}</span>
                        {hasActivities && (
                          <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? "bg-black" : isDangerous ? "bg-red-400 animate-pulse" : "bg-amber-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day scheduled activities scroll content card */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-extrabold uppercase text-amber-500 tracking-wider">
                      {lang === "fr" ? `${selectedDay} Juillet 2026` : `July ${selectedDay}, 2026`}
                    </span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-1">
                      <span>{weatherData[selectedDay]?.icon}</span>
                      <span>
                        {lang === "fr" ? weatherData[selectedDay]?.labelFr : weatherData[selectedDay]?.labelEn} ({weatherData[selectedDay]?.temp}°C)
                      </span>
                    </span>
                  </div>

                  {scheduledActivities[selectedDay] && scheduledActivities[selectedDay].length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleExportToDeviceCalendar(selectedDay)}
                        className="text-xs font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{lang === "fr" ? "Exporter jour" : "Export day"}</span>
                      </button>
                      <button
                        onClick={handleExportEntireCalendar}
                        className="text-xs font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1.5"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>{lang === "fr" ? "Tout exporter" : "Export all"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {scheduledActivities[selectedDay] && scheduledActivities[selectedDay].length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {scheduledActivities[selectedDay].map((act: any) => {
                      const isOutdoor = isOutdoorCategory(act.category);
                      const isDangerous = weatherData[selectedDay]?.isDangerousForOutdoor;
                      return (
                        <div key={act.id} className="bg-[#050505] p-4 border border-white/5 rounded-2xl space-y-3 relative group transition-colors hover:border-white/10">
                          {isOutdoor && isDangerous && (
                            <div className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-bold mb-1 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                              <span>{lang === "fr" ? "Alerte Tempête ! Risque élevé pour les activités d'extérieur" : "Storm Warning! High risk for outdoor activities"}</span>
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className="text-sm font-bold text-slate-200 leading-tight">{act.name}</span>
                              <span className="block text-[11px] text-slate-500 font-medium">🏷️ Code Promo: <strong className="text-amber-500">TERROIR15</strong> (-15%)</span>
                            </div>
                            <button
                              onClick={() => handleUnscheduleActivity(selectedDay, act.id)}
                              className="text-slate-500 hover:text-red-500 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                              title={lang === "fr" ? "Retirer" : "Remove"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-emerald-400 font-mono font-bold">✓ Partenaire Officiel</span>
                            <a
                              href={act.bookingUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all shadow-md shadow-amber-500/10"
                            >
                              {lang === "fr" ? "Réserver mon activité" : "Book now"}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <CalendarCheck className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {lang === "fr"
                        ? "Vous n'avez planifié aucune activité pour cette journée. Parcourez la liste pour concevoir votre programme !"
                        : "You have no plans scheduled for this day. Explore our list to customize your holiday programme!"}
                    </p>
                    <button
                      onClick={() => setActiveTab("discover")}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-xl transition-all"
                    >
                      {lang === "fr" ? "Découvrir des activités" : "Discover Activities"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Push notifications simulator / alerts Section */}
          {activeTab === "notifications" && (
            <NotificationCenter
              notifications={pushNotifications}
              isPremium={isPremium}
              userId={userId}
              lang={lang}
              onTriggerNotification={handleSimulateNotification}
              onClearNotifications={handleClearNotifications}
              onMarkAllAsRead={handleMarkAllRead}
            />
          )}

          {/* Tab: Cloud settings, sync & support Section */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              
              {/* Account Level Card */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compte Client</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/25">
                    Session Active
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-[#050505] border border-white/10 rounded-full text-slate-300">
                    <User className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">User Cloud ID</p>
                    <p className="text-sm font-bold text-white truncate font-mono">{userId}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Fonctions Premium
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight pr-2">
                      {isPremium ? "Débloqué (Gratuit, modifiable ci-contre)" : "Restrictions actives (Simulateur)"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-premium-simulator-toggle"
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setIsPremium(val);
                        syncSaveCloudData({ isPremium: val });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#050505] border border-white/10 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black" />
                  </label>
                </div>
              </div>

              {/* Cloud Synchronization panel */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <SmartphoneNfc className="w-4 h-4 text-amber-500 animate-pulse" />
                  {t.cloudSyncTitle}
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Connectez un autre appareil en saisissant le même identifiant pour synchroniser en temps réel vos favoris et vos notes privées.
                </p>

                <form onSubmit={handleConnectCloudSync} className="flex gap-2">
                  <input
                    id="sync-code-input"
                    type="text"
                    required
                    placeholder={t.cloudSyncPlaceholder}
                    value={syncCodeField}
                    onChange={(e) => setSyncCodeField(e.target.value)}
                    className="flex-1 bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden font-mono"
                  />
                  <button
                    id="btn-sync-device"
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/15 shrink-0"
                  >
                    {t.cloudSyncConnectButton}
                  </button>
                </form>

                {syncStatusMsg && (
                  <div className="mt-3.5 p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{syncStatusMsg}</span>
                  </div>
                )}
              </div>
              {/* Biometrics Settings lock */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-amber-500" />
                    {t.biometricTitle}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Android Keystore</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {t.biometricDesc}
                </p>

                <div className="flex items-center justify-between py-2 border-t border-white/5 pt-3.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {t.biometricEnabledLabel}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="checkbox-biometric-enable"
                      type="checkbox"
                      checked={biometricEnabled}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setBiometricEnabled(val);
                        if (!val) {
                          setIsBiometricAuthenticated(false);
                        }
                        syncSaveCloudData({ biometricEnabled: val });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#050505] border border-white/10 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black" />
                  </label>
                </div>
              </div>

              {/* Technical Premium support (Lock verification) */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  {t.contactSupport}
                </h4>

                {isPremium ? (
                  <form onSubmit={handleSubmitSupport} className="space-y-3">
                    <textarea
                      id="support-textarea"
                      required
                      rows={3}
                      value={supportText}
                      onChange={(e) => setSupportText(e.target.value)}
                      placeholder="Décrivez votre problème technique (ex: bug de géolocalisation, synchronisation)..."
                      className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden resize-none"
                    />
                    <button
                      id="btn-submit-support"
                      type="submit"
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                    >
                      {t.prioritySupportBtn}
                    </button>

                    {supportSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-start gap-1.5 leading-relaxed font-semibold">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{t.supportSuccessMsg}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-5 bg-[#050505] border border-dashed border-white/10 rounded-xl">
                    <Shield className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-semibold px-4 font-serif italic">
                      L'accès au support technique dédié est réservé aux abonnés Premium.
                    </p>
                    <button
                      id="btn-settings-support-upgrade"
                      onClick={() => setUpgradeModalOpen(true)}
                      className="mt-3.5 inline-flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-lg shadow-lg shadow-amber-500/15"
                    >
                      Débloquer l'accès support
                    </button>
                  </div>
                )}
              </div>

              {/* RGPD Disclaimer */}
              <div className="p-3.5 bg-[#0d0d0d] rounded-xl border border-white/10 text-[10px] text-slate-500 leading-relaxed flex gap-2">
                <input
                  id="checkbox-privacy-consent"
                  type="checkbox"
                  defaultChecked
                  className="rounded-sm mt-0.5 accent-amber-500"
                />
                <label htmlFor="checkbox-privacy-consent">
                  {t.privacyConsent}
                </label>
              </div>

            </div>
          )}

          {/* Tab: Legal Notice & Docs Section */}
          {activeTab === "legal" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  id="btn-legal-back-to-home"
                  onClick={() => setActiveTab("discover")}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  ← {lang === "fr" ? "Retour à l'exploration" : "Back to Explore"}
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {lang === "fr" ? "Documents & Mentions Légales" : "Documents & Legal Notices"}
                </h3>
              </div>

              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-xs space-y-5 text-slate-300">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-500 font-serif italic">1. Éditeur du service</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    L'application <strong>Saison & Terroir</strong> est éditée à titre de démonstration technologique par l'Office de Promotion Touristique et d'Ingénierie Digitale Régionale, immatriculée au Registre de Commerce sous le numéro SIREN 814-232-993, ayant son siège social en région Occitanie, France.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-500 font-serif italic">2. Hébergement</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Ce service applicatif est hébergé de manière sécurisée en Europe par la plateforme de conteneurs cloud Google Cloud Run (Europe West), assurant une haute disponibilité et un traitement ultra-rapide des requêtes locales.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-500 font-serif italic">3. Propriété Intellectuelle</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    L'ensemble des logos, illustrations vectorielles et codes d'intégration de l'application sont la propriété exclusive de notre plateforme. Les activités touristiques, guides locaux et descriptifs d'escapades de loisirs sont générés à la volée par l'intelligence artificielle Gemini (Google GenAI API) et sont présentés à titre indicatif et éducatif.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-500 font-serif italic">4. Conditions d'Utilisation</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    L'accès au service est ouvert gratuitement à tous les explorateurs. La fonctionnalité de synchronisation multi-appareils (Cloud Sync) est simulée en mémoire volatile et ne donne lieu à aucun frais. Les réservations sont simulées de manière réaliste dans le but d'illustrer une expérience utilisateur sans couture.
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Dernière mise à jour : Juillet 2026</span>
                  <span className="font-mono text-amber-500/80">Version 2.4.0 (Staging)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: GDPR / Privacy Policy Section */}
          {activeTab === "rgpd" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  id="btn-rgpd-back-to-home"
                  onClick={() => setActiveTab("discover")}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  ← {lang === "fr" ? "Retour à l'exploration" : "Back to Explore"}
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {lang === "fr" ? "Charte de Confidentialité (RGPD)" : "Privacy Charter (GDPR)"}
                </h3>
              </div>

              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-xs space-y-5 text-slate-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1 rounded-bl border-b border-l border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conforme RGPD
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-500 font-serif italic">Aucune donnée stockée ou revendue</h4>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679), notre application applique une politique stricte de respect de la vie privée :
                  </p>
                  <ul className="list-disc pl-4 space-y-2 text-xs text-slate-400">
                    <li>
                      <strong className="text-slate-200">Localisation éphémère :</strong> Les coordonnées issues du bouton de géolocalisation, ou les lieux saisis dans les champs de recherche (ville, code postal, adresse), sont transmis à Photon (Komoot) pour être convertis en coordonnées, puis à l'API Overpass (OpenStreetMap) pour récupérer les activités réellement répertoriées autour de ce point. Ces requêtes ne contiennent pas votre identité et ne sont pas conservées par l'application.
                    </li>
                    <li>
                      <strong className="text-slate-200">Zéro cookie publicitaire ou pisteur caché :</strong> Nous n'utilisons aucun traceur tiers, pixel Facebook, Google Analytics ou autre outil de profilage de comportement. Votre navigation reste 100% anonyme.
                    </li>
                    <li>
                      <strong className="text-slate-200">Sponsors transparents :</strong> Nos encarts publicitaires de sponsors locaux sont générés à la volée en fonction de la ville active et n'impliquent aucun échange de vos données personnelles avec les partenaires.
                    </li>
                    <li>
                      <strong className="text-slate-200">Sauvegarde locale chiffrée :</strong> Vos favoris, notes privées et paramètres d'agenda sont stockés localement sur votre propre navigateur via <code className="bg-white/5 px-1 py-0.5 rounded text-amber-400 font-mono text-[10px]">localStorage</code>. Vous pouvez les effacer instantanément en vidant le cache de votre navigateur.
                    </li>
                    <li>
                      <strong className="text-slate-200">Vos droits d'accès et d'effacement :</strong> Vous pouvez à tout moment réclamer la suppression des données synchronisées sur notre serveur de test en changeant simplement votre code d'identifiant aléatoire ou en contactant notre équipe.
                    </li>
                  </ul>
                </div>

                <div className="bg-[#050505] p-4 rounded-xl border border-white/5 space-y-2.5">
                  <p className="text-[11px] font-bold text-amber-400">L'application Saison & Terroir garantit une transparence totale :</p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Toutes vos saisies de texte (comme le pseudo de compte ou vos notes d'agenda d'activités) restent confidentielles et confinées à votre usage personnel exclusif.
                  </p>
                </div>

                <button
                  id="btn-confirm-rgpd-tab"
                  onClick={() => setActiveTab("discover")}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-450 text-black text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {lang === "fr" ? "J'ai compris, continuer l'exploration !" : "Got it, continue exploring!"}
                </button>
              </div>
            </div>
          )}

          {/* Quick Back to Top utility spacer */}
          <div className="flex justify-center pt-2 pb-4">
            <button
              id="btn-scroll-top"
              onClick={() => {
                listTopRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[10px] text-gray-400 dark:text-slate-500 font-bold hover:underline flex items-center gap-1"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {t.backToTop}
            </button>
          </div>

          {/* Bottom Footer legal & RGPD text links */}
          <div className="border-t border-white/5 pt-4 pb-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <button
                id="footer-btn-legal"
                onClick={() => setActiveTab("legal")}
                className="hover:text-amber-500 transition-colors"
              >
                {lang === "fr" ? "Mentions Légales" : "Legal Notices"}
              </button>
                     <button
                id="footer-btn-rgpd-modal"
                onClick={() => setPrivacyModalOpen(true)}
                className="hover:text-emerald-500 transition-colors flex items-center gap-1 text-emerald-500/90"
              >
                <Shield className="w-3 h-3" />
                <span>{lang === "fr" ? "Sécurité (Pop-up)" : "Security (Popup)"}</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-600 font-mono">
              © 2026 Saison & Terroir. {lang === "fr" ? "Aucune donnée stockée conformément au RGPD" : "No user data retained under EU law."}
            </p>
          </div>
        </main>
      </div>

        {/* 3. Bottom Mobile Tab Navigation Rail (Fixed to screen bottom on phone) */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 py-3 bg-[#0c0c0c]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around md:hidden shadow-2xl">
          <button
            id="tab-discover-btn"
            onClick={() => setActiveTab("discover")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all focus:outline-hidden ${
              activeTab === "discover"
                ? "text-amber-500 font-extrabold scale-105"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] tracking-tight">{t.discoverTab}</span>
          </button>
 
          <button
            id="tab-favorites-btn"
            onClick={() => setActiveTab("favorites")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all focus:outline-hidden ${
              activeTab === "favorites"
                ? "text-amber-500 font-extrabold scale-105"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-[9px] tracking-tight">{t.favoritesTab}</span>
          </button>

          <button
            id="tab-agenda-btn"
            onClick={() => setActiveTab("agenda")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all focus:outline-hidden ${
              activeTab === "agenda"
                ? "text-amber-500 font-extrabold scale-105"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] tracking-tight">{lang === "fr" ? "L'Agenda" : "Agenda"}</span>
          </button>
 
          <button
            id="tab-notifications-btn"
            onClick={() => setActiveTab("notifications")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all focus:outline-hidden ${
              activeTab === "notifications"
                ? "text-amber-500 font-extrabold scale-105"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {pushNotifications.some((n) => !n.read) && (
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[9px] tracking-tight">{t.notificationsTab}</span>
          </button>
 
          <button
            id="tab-settings-btn"
            onClick={() => {
              setActiveTab("settings");
              // Prompt biometric auth if active
              if (biometricEnabled && !isBiometricAuthenticated) {
                setBiometricModalOpen(true);
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all focus:outline-hidden ${
              activeTab === "settings"
                ? "text-amber-500 font-extrabold scale-105"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] tracking-tight">{t.settingsTab}</span>
          </button>
        </nav>

        {/* 4. Common Dialog Overlays */}
        <BiometricModal
          isOpen={biometricModalOpen}
          onClose={() => setBiometricModalOpen(false)}
          onSuccess={handleBiometricSuccess}
          lang={lang}
        />

        <PremiumModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onUpgradeSuccess={handleUpgradeSuccess}
          lang={lang}
        />

        <PrivacyModal
          isOpen={privacyModalOpen}
          onClose={() => setPrivacyModalOpen(false)}
          lang={lang}
        />

        {/* Onboarding & Diagnostics Overlays */}
        <OnboardingModal
          isOpen={onboardingOpen}
          onClose={handleOnboardingClose}
          lang={lang}
        />

        <UpdateDiagnosticsModal
          isOpen={diagnosticsModalOpen}
          onClose={() => setDiagnosticsModalOpen(false)}
          lang={lang}
          appVersion="1.3.0"
          userName={userName}
          userCoords={userCoords}
          onUpdateUserName={(name) => {
            setUserName(name);
            localStorage.setItem("user_nickname", name);
          }}
          onUpdateCoords={(coords) => {
            setUserCoords(coords);
            void loadActivitiesAt(coords.lat, coords.lng, null);
          }}
        />

        {/* Floating Build Update & Diagnostics Button (Bottom-Left) */}
        <div className="absolute bottom-18 md:bottom-5 left-4 z-40">
          <button
            id="floating-update-diagnostics-btn"
            onClick={() => setDiagnosticsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/90 hover:bg-black border border-amber-500/30 hover:border-amber-500 text-[10px] font-extrabold uppercase tracking-wider text-amber-500 rounded-full shadow-lg shadow-black/50 transition-all hover:scale-105 active:scale-[0.98] group font-mono backdrop-blur-md"
            title={lang === "fr" ? "Vérification Système & Mises à Jour" : "System Verification & Updates"}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>v1.3.0</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out whitespace-nowrap">
              • {lang === "fr" ? "Sécurité & Audit" : "Security & Audit"}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
