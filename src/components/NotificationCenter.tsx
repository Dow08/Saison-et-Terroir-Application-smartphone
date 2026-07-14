import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, BellRing, Sparkles, Send, Trash2, CheckCircle, Info } from "lucide-react";
import { Language, LOCALIZATION, PushNotification } from "../types";

interface NotificationCenterProps {
  notifications: PushNotification[];
  isPremium: boolean;
  userId: string;
  lang: Language;
  onTriggerNotification: (title: string, body: string, category: string) => void;
  onClearNotifications: () => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationCenter({
  notifications,
  isPremium,
  userId,
  lang,
  onTriggerNotification,
  onClearNotifications,
  onMarkAllAsRead
}: NotificationCenterProps) {
    const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [simulating, setSimulating] = useState(false);

  const t = LOCALIZATION[lang];

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !bodyInput.trim()) return;

    setSimulating(true);
    // Simulate real-time delay
    setTimeout(() => {
      onTriggerNotification(
        titleInput.trim(),
        bodyInput.trim(),
        "custom"
      );
      setTitleInput("");
      setBodyInput("");
      setSimulating(false);
    }, 800);
  };

  const handleCheckUpdates = () => {
    onTriggerNotification(
      lang === "fr" 
        ? "Mise à jour installée : Version 1.2.0 ! 🚀" 
        : "System Update Installed: Version 1.2.0! 🚀",
      lang === "fr"
        ? "Saison & Terroir a été mis à jour avec succès ! Découvrez nos nouveaux filtres avancés de gamme de prix ($, $$, $$$), d'avis minimums, et l'export d'agenda local compatible avec le calendrier de votre téléphone (.ics)."
        : "Season & Soil has been successfully updated! Check out our new advanced filters for price ranges ($, $$, $$$), minimum reviews, and phone calendar .ics exports.",
      "system"
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "system": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "weather": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "promo": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div id="notification-center" className="space-y-6">
      {/* Simulation Dashboard */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <BellRing className="w-5 h-5 text-amber-500" />
          <h4 className="text-base font-serif italic text-white">{t.notificationPushTitle}</h4>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 border border-amber-500/30 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Accès Voyageur Unlocked
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
          Testez l'envoi d'alertes personnalisées ou vérifiez les dernières mises à jour du système directement ci-dessous.
        </p>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <input
              id="notif-title-input"
              type="text"
              required
              placeholder={t.notificationSimulatePlaceholder}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden"
            />
            <textarea
              id="notif-body-input"
              required
              placeholder={t.notificationSimulateBodyPlaceholder}
              rows={2}
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden resize-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <button
              id="btn-trigger-update-check"
              type="button"
              onClick={handleCheckUpdates}
              className="w-full sm:w-auto py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold text-[10.5px] rounded-xl transition-all border border-amber-500/20 flex items-center justify-center gap-1 focus:outline-hidden"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{lang === "fr" ? "Vérifier les Mises à Jour" : "Check for App Updates"}</span>
            </button>

            <button
              id="btn-trigger-notif"
              type="submit"
              disabled={simulating}
              className="w-full sm:w-auto py-2.5 px-5 bg-amber-500 hover:bg-amber-450 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 focus:outline-hidden shadow-lg shadow-amber-500/10"
            >
              {simulating ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {t.notificationSimulateButton}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Queue list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            {t.notificationsTitle} ({notifications.length})
          </h4>

          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                id="btn-mark-read"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-amber-500 font-bold hover:underline"
              >
                Tout marquer lu
              </button>
              <button
                id="btn-clear-notifs"
                onClick={onClearNotifications}
                className="text-[11px] text-red-400 font-bold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Effacer
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 text-center text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="text-xs font-semibold">Aucune alerte active pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-4 rounded-2xl border bg-[#0d0d0d] ${
                    notif.read ? "border-white/5 opacity-55" : "border-amber-500/30 shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${getCategoryColor(notif.category)}`}>
                      {notif.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white">
                        {notif.title}
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.body}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
