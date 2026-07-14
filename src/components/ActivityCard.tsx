import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { Activity, Language, LOCALIZATION } from "../types";
import { getJulyWeather, isOutdoorCategory } from "../utils/weather";

interface ActivityCardProps {
  key?: string;
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isPremium: boolean;
  biometricEnabled: boolean;
  isBiometricAuthenticated: boolean;
  onTriggerBiometric: () => void;
  lang: Language;
  onOpenUpgradeModal: () => void;
  customNote: string;
  onSaveNote: (note: string) => void;
  onSchedule?: (day: number) => void;
  userCoords?: { lat: number; lng: number } | null;
}

const CATEGORY_IMAGES: { [key: string]: string } = {
  Nature: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=300&q=80",
  Culture: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=300&q=80",
  Gastronomy: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80",
  Sport: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=300&q=80",
  Relaxation: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
};

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getActivityImage = (activity: any) => {
  const name = (activity.name || "").toLowerCase();
  if (name.includes("verdon") || name.includes("gorge")) {
    return "https://images.unsplash.com/photo-15555088652-021faa106b9b?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("vin") || name.includes("wine") || name.includes("fromage") || name.includes("cheese")) {
    return "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("surf") || name.includes("plage") || name.includes("beach") || name.includes("ocean") || name.includes("atlantique")) {
    return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("canoë") || name.includes("kayak") || name.includes("canyoning")) {
    return "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("spa") || name.includes("thermes") || name.includes("massage") || name.includes("bien-être")) {
    return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("château") || name.includes("historique") || name.includes("monument") || name.includes("musée")) {
    return "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=300&q=80";
  }
  if (name.includes("randonnée") || name.includes("montagne") || name.includes("sommet") || name.includes("pyrénées")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80";
  }
  return CATEGORY_IMAGES[activity.category] || CATEGORY_IMAGES["Nature"];
};

export default function ActivityCard({
  activity,
  isFavorite,
  onToggleFavorite,
  isPremium,
  biometricEnabled,
  isBiometricAuthenticated,
  onTriggerBiometric,
  lang,
  onOpenUpgradeModal,
  customNote,
  onSaveNote,
  onSchedule,
  userCoords
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(customNote || "");
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [weatherWarningDay, setWeatherWarningDay] = useState<number | null>(null);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareText = lang === "fr"
    ? `Découvre cette superbe activité sur Saison & Terroir : "${activity.name}" (${activity.bestPeriod}) ! - ${activity.description}`
    : `Check out this amazing activity on Season & Soil: "${activity.name}" (${activity.bestPeriod})! - ${activity.description}`;

  const shareUrl = window.location.href;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${shareText}\nPlus d'infos: ${shareUrl}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.name,
          text: shareText,
          url: shareUrl,
        });
        setShowShareDropdown(false);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopyLink(e);
    }
  };

  const weatherData = getJulyWeather();
  const isOutdoor = isOutdoorCategory(activity.category);

  const t = LOCALIZATION[lang];

  // Helper to dynamically get the Lucide icon component
  const getIconComponent = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    return IconComp ? <IconComp className="w-5 h-5" /> : <Icons.Compass className="w-5 h-5" />;
  };

  // Pre-fill email composer template
  const handleOpenEmailComposer = () => {
    setEmailSubject(
      lang === "fr"
        ? `Demande de réservation - ${activity.name}`
        : `Booking Inquiry - ${activity.name}`
    );
    setEmailBody(
      lang === "fr"
        ? `Bonjour,\n\nJe souhaite effectuer une réservation pour l'activité "${activity.name}".\nPourriez-vous m'indiquer vos disponibilités actuelles ainsi que les modalités ?\n\nCordialement,\n[Membre Voyageur Saison & Terroir]`
        : `Hello,\n\nI would like to make a reservation for the activity "${activity.name}".\nCould you please let me know your current availability and the booking procedure?\n\nBest regards,\n[Season & Soil Member]`
    );
    setEmailSent(false);
    setEmailComposerOpen(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate email dispatch
    setTimeout(() => {
      setEmailSent(true);
      setTimeout(() => {
        setEmailComposerOpen(false);
        setEmailSent(false);
      }, 2000);
    }, 1000);
  };

  return (
    <motion.div
      id={`activity-card-${activity.id}`}
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-slate-50 dark:bg-[#0d0d0d] border ${
        isExpanded ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]" : "border-slate-200 dark:border-white/10"
      } rounded-3xl p-6 transition-all duration-300 overflow-hidden relative group hover:bg-slate-100/40 dark:hover:bg-white/[0.04]`}
    >
      {/* Category Tag & Favorite heart */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-semibold rounded-full uppercase tracking-wider border border-amber-500/20">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {t.categories[activity.category] || activity.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/25 animate-pulse">
            🏷️ -15% Sponso
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id={`btn-schedule-${activity.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowScheduleDropdown(!showScheduleDropdown);
              setShowShareDropdown(false);
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 rounded-full transition-colors focus:outline-hidden"
            title={lang === "fr" ? "Planifier dans mon agenda" : "Schedule in my agenda"}
          >
            <Icons.CalendarPlus className="w-5.5 h-5.5" />
          </button>

          <button
            id={`btn-share-${activity.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowShareDropdown(!showShareDropdown);
              setShowScheduleDropdown(false);
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 rounded-full transition-colors focus:outline-hidden"
            title={lang === "fr" ? "Partager l'activité" : "Share activity"}
          >
            <Icons.Share2 className="w-5.5 h-5.5" />
          </button>

          <button
            id={`btn-fav-${activity.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-red-500 rounded-full transition-colors focus:outline-hidden"
            aria-label="Add to favorites"
          >
            {isFavorite ? (
              <Icons.Heart className="w-5.5 h-5.5 fill-red-500 text-red-500 animate-pulse" />
            ) : (
              <Icons.Heart className="w-5.5 h-5.5 text-slate-400 dark:text-slate-500" />
            )}
          </button>

          {showShareDropdown && (
            <div className="absolute right-0 top-11 bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl p-4 z-45 w-64 space-y-3 text-white text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="block font-bold text-[10px] uppercase text-slate-400 tracking-wider">
                  {lang === "fr" ? "📤 Partager l'activité" : "📤 Share Activity"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareDropdown(false);
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareDropdown(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition-all"
                >
                  <Icons.MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareDropdown(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 transition-all"
                >
                  <Icons.Facebook className="w-4 h-4 text-blue-400" />
                  <span>Facebook</span>
                </a>

                {/* SMS */}
                <a
                  href={`sms:?&body=${encodeURIComponent(shareText + " " + shareUrl)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareDropdown(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 transition-all"
                >
                  <Icons.Smartphone className="w-4 h-4 text-amber-400" />
                  <span>{lang === "fr" ? "SMS (Contacts)" : "SMS (Contacts)"}</span>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 transition-all text-left w-full"
                >
                  {linkCopied ? (
                    <>
                      <Icons.Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{lang === "fr" ? "Lien copié !" : "Link copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="w-4 h-4 text-slate-400" />
                      <span>{lang === "fr" ? "Copier le lien" : "Copy Link"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {showScheduleDropdown && (
            <div className="absolute right-0 top-11 bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl p-4 z-45 w-64 space-y-3 text-white">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="block font-bold text-[10px] uppercase text-slate-400 tracking-wider">
                  {lang === "fr" ? "📅 Planifier (Juillet 2026)" : "📅 Schedule (July 2026)"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowScheduleDropdown(false);
                    setWeatherWarningDay(null);
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </div>

              {weatherWarningDay !== null ? (
                // Weather Advisory panel
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                      <Icons.AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        {lang === "fr" ? "Alerte Météo !" : "Weather Warning!"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      {lang === "fr" 
                        ? `Le ${weatherWarningDay} Juillet, la météo prévoit : ${weatherData[weatherWarningDay]?.labelFr} (${weatherData[weatherWarningDay]?.icon}). Il est fortement déconseillé de pratiquer cette activité de plein air.`
                        : `On July ${weatherWarningDay}, the forecast is: ${weatherData[weatherWarningDay]?.labelEn} (${weatherData[weatherWarningDay]?.icon}). It is highly discouraged to do this outdoor activity.`}
                    </p>
                    <div className="pt-1.5 border-t border-red-500/10 text-[10px] text-amber-400 font-semibold flex items-start gap-1">
                      <Icons.Sparkles className="w-3 h-3 shrink-0 text-amber-500 mt-0.5" />
                      <span>
                        {lang === "fr"
                          ? "💡 Conseil : Privilégiez plutôt une activité Culturelle ou de Gastronomie pour ce jour-là !"
                          : "💡 Suggestion: Consider planning a Cultural or Gastronomy activity on this day instead!"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs font-bold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWeatherWarningDay(null);
                      }}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-center"
                    >
                      {lang === "fr" ? "Annuler" : "Cancel"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSchedule) onSchedule(weatherWarningDay);
                        setShowScheduleDropdown(false);
                        setWeatherWarningDay(null);
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-center"
                    >
                      {lang === "fr" ? "Continuer" : "Proceed"}
                    </button>
                  </div>
                </div>
              ) : (
                // Standard calendar day list
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-1.5 text-center max-h-36 overflow-y-auto custom-scrollbar">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const dayWeather = weatherData[day];
                      const isDayDangerous = dayWeather?.isDangerousForOutdoor;
                      
                      return (
                        <button
                          key={day}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutdoor && isDayDangerous) {
                              setWeatherWarningDay(day);
                            } else {
                              if (onSchedule) onSchedule(day);
                              setShowScheduleDropdown(false);
                            }
                          }}
                          className={`relative py-1 rounded text-[10px] font-mono font-bold transition-all flex flex-col items-center justify-center ${
                            isOutdoor && isDayDangerous
                              ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                              : "bg-white/5 text-slate-300 hover:bg-amber-500 hover:text-black"
                          }`}
                          title={`${day} Juillet : ${lang === "fr" ? dayWeather?.labelFr : dayWeather?.labelEn}`}
                        >
                          <span>{day}</span>
                          <span className="text-[8px] mt-0.5">{dayWeather?.icon || "☀️"}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium leading-tight flex items-center gap-1 pt-1 border-t border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{lang === "fr" ? "Rouge = Météo dangereuse" : "Red = Adverse weather"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main card info clickable to expand */}
      <div
        id={`card-header-${activity.id}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer flex items-start gap-4"
      >
        {/* Visual Thumbnail image of the activity with a small overlay badge for the icon */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 group-hover:border-amber-500/30 transition-all shadow-md">
          <img
            src={getActivityImage(activity)}
            alt={activity.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute bottom-1 right-1 p-1 bg-black/80 backdrop-blur-xs rounded-lg text-amber-500 border border-white/5 flex items-center justify-center">
            {React.cloneElement(getIconComponent(activity.icon), { className: "w-3 h-3" } as any)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-serif italic text-slate-850 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug tracking-tight">
            {activity.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Icons.Calendar className="w-3.5 h-3.5 text-amber-500/70" />
              {t.periodLabel}: {activity.bestPeriod}
            </span>
            {userCoords && activity.lat && activity.lng && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/15 text-[10px] font-mono shrink-0 shadow-xs">
                📍 {getDistanceInKm(userCoords.lat, userCoords.lng, activity.lat, activity.lng).toFixed(1)} km
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0 text-slate-400 hover:text-slate-950 dark:hover:text-white p-1">
          {isExpanded ? <Icons.ChevronUp className="w-5 h-5" /> : <Icons.ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Short Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed font-sans">
        {activity.description}
      </p>

      {/* Expandable Details Container */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`expanded-content-${activity.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-slate-200 dark:border-white/10 mt-5 pt-5 space-y-5"
          >
            {/* Reviews, Price & Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Indicative price */}
              <div className="bg-slate-100/60 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">
                  {t.priceLabel}
                </span>
                <span className="text-sm font-serif font-extrabold text-slate-800 dark:text-white">
                  {activity.price}
                </span>
              </div>

              {/* Price comparison */}
              <div className="bg-slate-100/60 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">
                  {t.comparisonLabel}
                </span>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-500">
                  {activity.comparison}
                </span>
              </div>

              {/* Google Reviews */}
              <div className="bg-slate-100/60 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider">
                    {t.reviewsLabel}
                  </span>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold">
                    <Icons.Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{activity.googleReviews.rating}</span>
                  </div>
                </div>

                {/* Multiple Reviews or Recent Review fallback */}
                {activity.googleReviews.reviewsList && activity.googleReviews.reviewsList.length > 0 ? (
                  <div className="space-y-3.5 my-2">
                    {activity.googleReviews.reviewsList.map((rev, rIdx) => (
                      <div key={rIdx} className="border-t border-slate-200/50 dark:border-white/5 pt-2.5 first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Icons.User className="w-3 h-3 text-amber-500" />
                            {rev.author}
                          </span>
                          <span className="flex items-center text-amber-500 text-[10px]">
                            {Array.from({ length: Math.round(rev.rating) }).map((_, sIdx) => (
                              <Icons.Star key={sIdx} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            ))}
                          </span>
                        </div>
                        <p className="italic text-slate-600 dark:text-slate-400 mt-1 pl-4 border-l-2 border-amber-500/30">
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-slate-600 dark:text-slate-300 mt-1">
                    "{activity.googleReviews.recentReview}"
                  </p>
                )}

                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block font-medium">
                  Basé sur {activity.googleReviews.count.toLocaleString()} avis d'utilisateurs
                </span>
              </div>
            </div>

            {/* Link to external official website (Direct redirection) */}
            {activity.website && (
              <a
                href={activity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-amber-500/20 text-xs shadow-xs"
              >
                <Icons.Globe className="w-4 h-4" />
                <span>Visiter le site officiel de l'activité</span>
                <Icons.ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Direct Booking & Contact details container */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-100/40 dark:bg-[#050505] overflow-hidden relative">
              <div className="flex items-center gap-1.5 mb-3">
                <Icons.Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  {t.bookingLabel}
                </h5>
              </div>

              {/* Booking Details */}
              <div className="space-y-3.5 text-xs">
                {/* Phone number */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <Icons.Phone className="w-3.5 h-3.5 text-amber-500" />
                    {t.phoneLabel}
                  </span>
                  <a
                    href={`tel:${activity.phone}`}
                    className="text-amber-600 dark:text-amber-500 font-bold hover:underline"
                  >
                    {activity.phone}
                  </a>
                </div>

                {/* Email contact */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <Icons.Mail className="w-3.5 h-3.5 text-amber-500" />
                    {t.emailLabel}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium select-all">
                    {activity.email}
                  </span>
                </div>

                {/* Direct Book Mail Composer button */}
                <div className="pt-2">
                  <button
                    id={`btn-open-email-composer-${activity.id}`}
                    onClick={handleOpenEmailComposer}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-black dark:bg-white dark:hover:bg-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Icons.MailPlus className="w-4 h-4 text-amber-500" />
                    {t.directBookingLabel}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Private Note Section (Fulfills biometric secure memos) */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-100/40 dark:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icons.NotebookPen className="w-3.5 h-3.5 text-amber-500" />
                  {t.customNoteTitle}
                </span>

                {biometricEnabled && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Icons.Lock className="w-3 h-3" />
                    Secure Note
                  </span>
                )}
              </div>

              {biometricEnabled && !isBiometricAuthenticated ? (
                // Locked by Biometrics
                <div className="text-center py-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                    Cette note est cryptée localement et protégée par verrouillage biométrique.
                  </p>
                  <button
                    id={`btn-unlock-note-${activity.id}`}
                    onClick={onTriggerBiometric}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                  >
                    <Icons.Fingerprint className="w-4 h-4 text-amber-500" />
                    Déverrouiller avec Face ID
                  </button>
                </div>
              ) : (
                // Unlocked or No Biometrics
                <div className="space-y-2">
                  <textarea
                    id={`textarea-note-${activity.id}`}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t.customNotePlaceholder}
                    rows={2}
                    className="w-full bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      id={`btn-save-note-${activity.id}`}
                      onClick={() => onSaveNote(noteText)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold rounded-xl transition-all"
                    >
                      {t.customNoteSaveButton}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Email Booking Composer Dialog */}
      <AnimatePresence>
        {emailComposerOpen && (
          <div id="email-composer-modal" className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0d0d0d] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-white/10">
                <h6 className="text-base font-serif italic flex items-center gap-2 text-slate-900 dark:text-white">
                  <Icons.Mail className="w-4 h-4 text-amber-500" />
                  {t.directBookingLabel}
                </h6>
                <button
                  id="btn-close-composer"
                  onClick={() => setEmailComposerOpen(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Icons.X className="w-4.5 h-4.5" />
                </button>
              </div>

              {emailSent ? (
                <div className="text-center py-6">
                  <Icons.CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {lang === "fr" ? "E-mail de réservation envoyé !" : "Booking email sent!"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === "fr" ? "Vous recevrez une réponse sous peu." : "You will receive a response shortly."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-3.5 text-xs">
                  <div>
                    <span className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">À (Destinataire) :</span>
                    <input
                      type="text"
                      disabled
                      value={activity.email}
                      className="w-full bg-slate-100 dark:bg-white/5 p-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <span className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Sujet :</span>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#050505] p-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-hidden focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <span className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">Message :</span>
                    <textarea
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-50 dark:bg-[#050505] p-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-hidden focus:border-amber-500/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="btn-cancel-email"
                      type="button"
                      onClick={() => setEmailComposerOpen(false)}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-white/10 transition-all"
                    >
                      {t.cancelLabel}
                    </button>
                    <button
                      id="btn-send-email-booking"
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Icons.Send className="w-3.5 h-3.5" />
                      {lang === "fr" ? "Envoyer" : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
