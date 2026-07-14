import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { Activity, Language, LOCALIZATION, DATA_LABELS } from "../types";
import { getJulyWeather, isOutdoorCategory } from "../utils/weather";

interface ActivityCardProps {
  key?: string;
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  biometricEnabled: boolean;
  isBiometricAuthenticated: boolean;
  onTriggerBiometric: () => void;
  lang: Language;
  customNote: string;
  onSaveNote: (note: string) => void;
  onSchedule?: (day: number) => void;
  onShowOnMap?: () => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Nature: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  Culture: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  Gastronomy: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Sport: "text-red-500 bg-red-500/10 border-red-500/20",
  Relaxation: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

export default function ActivityCard({
  activity,
  isFavorite,
  onToggleFavorite,
  biometricEnabled,
  isBiometricAuthenticated,
  onTriggerBiometric,
  lang,
  customNote,
  onSaveNote,
  onSchedule,
  onShowOnMap,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(customNote || "");
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [weatherWarningDay, setWeatherWarningDay] = useState<number | null>(null);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const t = LOCALIZATION[lang];
  const d = DATA_LABELS[lang];
  const weatherData = getJulyWeather();
  const isOutdoor = isOutdoorCategory(activity.category);

  const shareText =
    lang === "fr"
      ? `${activity.name} (${activity.typeLabel}) — à ${activity.distanceKm.toFixed(1)} km. Fiche : ${activity.osmUrl}`
      : `${activity.name} (${activity.typeLabel}) — ${activity.distanceKm.toFixed(1)} km away. Details: ${activity.osmUrl}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareText);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getIconComponent = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    return IconComp ? <IconComp className="w-6 h-6" /> : <Icons.Compass className="w-6 h-6" />;
  };

  /**
   * Tarif, affiche directement dans l'en-tete de la fiche.
   *
   * Le montant exact est montre quand OpenStreetMap le renseigne (tag charge).
   * Sinon on indique honnetement qu'il n'est pas connu, plutot que de laisser
   * croire a la gratuite par l'absence d'indication.
   */
  const feeBadge = () => {
    if (activity.fee === "free") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/25">
          <Icons.Ticket className="w-3 h-3" />
          {d.feeFree}
        </span>
      );
    }
    if (activity.fee === "paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/25">
          <Icons.Ticket className="w-3 h-3" />
          {activity.charge ?? d.feePaid}
        </span>
      );
    }
    // OpenStreetMap ne renseigne le tarif que pour une minorite de lieux, et
    // pratiquement jamais le montant. Quand le site officiel existe, on y
    // renvoie directement : c'est la que le tarif se trouve reellement.
    if (activity.website) {
      return (
        <a
          href={activity.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 hover:bg-amber-500/15 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-[10px] font-medium rounded-md border border-slate-500/20 transition-colors"
        >
          <Icons.Ticket className="w-3 h-3" />
          {d.feeOnSite}
          <Icons.ExternalLink className="w-2.5 h-2.5" />
        </a>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 text-slate-500 dark:text-slate-400 text-[10px] font-medium rounded-md border border-slate-500/20">
        <Icons.HelpCircle className="w-3 h-3" />
        {d.feeUnknown}
      </span>
    );
  };

  return (
    <motion.div
      id={`activity-card-${activity.id}`}
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-slate-50 dark:bg-[#0d0d0d] border ${
        isExpanded
          ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]"
          : "border-slate-200 dark:border-white/10"
      } rounded-3xl p-6 transition-all duration-300 relative group hover:bg-slate-100/40 dark:hover:bg-white/[0.04]`}
    >
      {/* Catégorie, tarif réel, actions */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider border ${
              CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.Nature
            }`}
          >
            {t.categories[activity.category] || activity.category}
          </span>
          {feeBadge()}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowScheduleDropdown(!showScheduleDropdown);
              setShowShareDropdown(false);
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 rounded-full transition-colors"
            title={lang === "fr" ? "Planifier dans mon agenda" : "Schedule in my agenda"}
          >
            <Icons.CalendarPlus className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareDropdown(!showShareDropdown);
              setShowScheduleDropdown(false);
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 rounded-full transition-colors"
            title={lang === "fr" ? "Partager" : "Share"}
          >
            <Icons.Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label={lang === "fr" ? "Ajouter aux favoris" : "Add to favorites"}
          >
            {isFavorite ? (
              <Icons.Heart className="w-5 h-5 fill-red-500 text-red-500" />
            ) : (
              <Icons.Heart className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            )}
          </button>

          {showShareDropdown && (
            <div className="absolute right-0 top-11 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-45 w-64 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="block font-bold text-[10px] uppercase text-slate-500 tracking-wider">
                  {lang === "fr" ? "Partager" : "Share"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareDropdown(false);
                  }}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </div>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <Icons.MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`sms:?&body=${encodeURIComponent(shareText)}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400"
              >
                <Icons.Smartphone className="w-4 h-4" />
                <span>SMS</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2.5 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 w-full"
              >
                {linkCopied ? (
                  <>
                    <Icons.Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">{lang === "fr" ? "Copié !" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy className="w-4 h-4 text-slate-400" />
                    <span>{lang === "fr" ? "Copier" : "Copy"}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {showScheduleDropdown && (
            <div className="absolute right-0 top-11 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl p-4 z-45 w-64 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="block font-bold text-[10px] uppercase text-slate-500 tracking-wider">
                  {lang === "fr" ? "Planifier (Juillet 2026)" : "Schedule (July 2026)"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowScheduleDropdown(false);
                    setWeatherWarningDay(null);
                  }}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Icons.X className="w-3.5 h-3.5" />
                </button>
              </div>

              {weatherWarningDay !== null ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                      <Icons.AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{lang === "fr" ? "Alerte météo" : "Weather warning"}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                      {lang === "fr"
                        ? `Le ${weatherWarningDay} juillet : ${weatherData[weatherWarningDay]?.labelFr}. Activité de plein air déconseillée.`
                        : `On July ${weatherWarningDay}: ${weatherData[weatherWarningDay]?.labelEn}. Outdoor activity not advised.`}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWeatherWarningDay(null);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      {t.cancelLabel}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSchedule) onSchedule(weatherWarningDay);
                        setShowScheduleDropdown(false);
                        setWeatherWarningDay(null);
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                    >
                      {lang === "fr" ? "Continuer" : "Proceed"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5 text-center max-h-36 overflow-y-auto">
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
                        className={`py-1 rounded text-[10px] font-mono font-bold flex flex-col items-center ${
                          isOutdoor && isDayDangerous
                            ? "bg-red-500/10 border border-red-500/20 text-red-500"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-black"
                        }`}
                      >
                        <span>{day}</span>
                        <span className="text-[8px]">{dayWeather?.icon || "☀️"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* En-tête : icône de catégorie, nom réel, type réel, distance réelle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer flex items-start gap-4"
      >
        <div
          className={`w-14 h-14 rounded-2xl shrink-0 border flex items-center justify-center ${
            CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.Nature
          }`}
        >
          {getIconComponent(activity.icon)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-serif italic text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
            {activity.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Icons.Tag className="w-3.5 h-3.5 text-amber-500/70" />
              {activity.typeLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/15 text-[10px] font-mono">
              <Icons.MapPin className="w-3 h-3" />
              {activity.distanceKm.toFixed(1)} km
            </span>
          </p>
        </div>

        <div className="shrink-0 text-slate-400 p-1">
          {isExpanded ? <Icons.ChevronUp className="w-5 h-5" /> : <Icons.ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Détails : uniquement les champs réellement présents dans OSM */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-slate-200 dark:border-white/10 mt-5 pt-5 space-y-4 overflow-hidden"
          >
            <div className="space-y-2.5 text-xs">
              {activity.address && (
                <div className="flex items-start gap-2">
                  <Icons.MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-500 font-semibold">{d.address} : </span>
                    {activity.address}
                  </span>
                </div>
              )}

              {activity.openingHours && (
                <div className="flex items-start gap-2">
                  <Icons.Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-mono">
                    <span className="text-slate-500 dark:text-slate-500 font-semibold font-sans">
                      {d.openingHours} :{" "}
                    </span>
                    {activity.openingHours}
                  </span>
                </div>
              )}

              {activity.phone && (
                <div className="flex items-start gap-2">
                  <Icons.Phone className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <a href={`tel:${activity.phone}`} className="text-amber-600 dark:text-amber-500 font-bold hover:underline">
                    {activity.phone}
                  </a>
                </div>
              )}

              {activity.email && (
                <div className="flex items-start gap-2">
                  <Icons.Mail className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <a href={`mailto:${activity.email}`} className="text-amber-600 dark:text-amber-500 font-bold hover:underline break-all">
                    {activity.email}
                  </a>
                </div>
              )}

              {activity.fee === "unknown" && (
                <div className="flex items-start gap-2">
                  <Icons.HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-500 italic">{d.feeUnknown}</span>
                </div>
              )}
            </div>

            {/* Liens sortants vers des sources réelles */}
            <div className="grid grid-cols-1 gap-2">
              {activity.website && (
                <a
                  href={activity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/20 text-xs"
                >
                  <Icons.Globe className="w-4 h-4" />
                  <span>{d.officialWebsite}</span>
                  <Icons.ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <a
                href={activity.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-xs"
              >
                <Icons.Star className="w-4 h-4 text-amber-500" />
                <span>{d.viewReviews}</span>
                <Icons.ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onShowOnMap && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowOnMap();
                  }}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-xs"
                >
                  <Icons.Map className="w-4 h-4 text-amber-500" />
                  <span>{d.viewOnMap}</span>
                </button>
              )}
            </div>

            {/* Notes privées */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-100/40 dark:bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Icons.NotebookPen className="w-3.5 h-3.5 text-amber-500" />
                  {t.customNoteTitle}
                </span>
              </div>

              {biometricEnabled && !isBiometricAuthenticated ? (
                <div className="text-center py-3">
                  <button
                    onClick={onTriggerBiometric}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10"
                  >
                    <Icons.Fingerprint className="w-4 h-4 text-amber-500" />
                    {t.biometricScanButton}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t.customNotePlaceholder}
                    rows={2}
                    className="w-full bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => onSaveNote(noteText)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold rounded-xl"
                    >
                      {t.customNoteSaveButton}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Source vérifiable */}
            <a
              href={activity.osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-amber-500 transition-colors"
            >
              <Icons.Database className="w-3 h-3" />
              <span>{d.source} : OpenStreetMap</span>
              <Icons.ExternalLink className="w-2.5 h-2.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
