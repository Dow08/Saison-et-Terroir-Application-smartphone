import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, MapPin, Sparkles, User, Check, Loader2, ArrowRight } from "lucide-react";
import { Language } from "../types";
import { getCurrentCoords, geoErrorMessage } from "../utils/geo";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (nickname: string, coords: { lat: number; lng: number } | null) => void;
  lang: Language;
}

export default function OnboardingModal({ isOpen, onClose, lang }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState<string>("");
  const [geolocating, setGeolocating] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocStatus, setGeolocStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestGeoloc = async () => {
    setGeolocating(true);
    setGeolocStatus("idle");
    setErrorMsg(null);

    try {
      setCoords(await getCurrentCoords());
      setGeolocStatus("success");
    } catch (err) {
      console.error("Geolocation error:", err);
      setGeolocStatus("error");
      setErrorMsg(geoErrorMessage(err, lang));
    } finally {
      setGeolocating(false);
    }
  };

  const handleFinish = () => {
    const finalNickname = nickname.trim() || (lang === "fr" ? "Explorateur" : "Explorer");
    onClose(finalNickname, coords);
  };

  return (
    <AnimatePresence>
      <div
        id="onboarding-overlay"
        className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          id="onboarding-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Accent lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Steps Header */}
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-black rounded-lg">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                Saison & Terroir
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold text-slate-400">
              <span className={step === 1 ? "text-amber-400 font-extrabold" : ""}>
                {lang === "fr" ? "Étape 1" : "Step 1"}
              </span>
              <span>/</span>
              <span className={step === 2 ? "text-amber-400 font-extrabold" : ""}>
                {lang === "fr" ? "Étape 2" : "Step 2"}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h3 className="text-xl font-serif italic text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {lang === "fr" ? "Bienvenue, Explorateur" : "Welcome, Explorer"}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === "fr"
                      ? "Découvrez l'authenticité locale de l'Occitanie et d'ailleurs. Pour personnaliser votre expérience et sauvegarder vos activités, comment devons-nous vous appeler ?"
                      : "Discover the local authenticity of Occitanie and beyond. To personalize your experience and save your plans, what should we call you?"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    {lang === "fr" ? "Votre Nom d'Utilisateur / Pseudo" : "Your Username / Nickname"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="onboarding-nickname-input"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={25}
                      placeholder={lang === "fr" ? "Ex: Pierre, Marie81..." : "e.g., Alice, Bob99..."}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    id="onboarding-next-btn"
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-450 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                  >
                    <span>{lang === "fr" ? "Suivant : Localisation" : "Next: Location"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h3 className="text-xl font-serif italic text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500 animate-pulse" />
                    {lang === "fr" ? "Où êtes-vous ?" : "Where are you?"}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === "fr"
                      ? "Pour vous proposer les meilleures activités saisonnières adaptées à la météo autour de vous, l'application a besoin d'accéder à votre géolocalisation ou vous pouvez choisir de saisir une ville manuellement plus tard."
                      : "To recommend the best seasonal activities matching the real-time weather around you, the app requires location access, or you can search manually later."}
                  </p>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {lang === "fr" ? "Accès à la Position" : "Location Permission"}
                    </span>
                    {geolocStatus === "success" && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {lang === "fr" ? "Configuré" : "Configured"}
                      </span>
                    )}
                  </div>

                  <button
                    id="onboarding-geoloc-btn"
                    onClick={handleRequestGeoloc}
                    disabled={geolocating}
                    className={`w-full py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      geolocStatus === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-white/5 hover:bg-white/10 border-white/15 text-white active:scale-98"
                    }`}
                  >
                    {geolocating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {geolocating
                        ? lang === "fr"
                          ? "Recherche de la position..."
                          : "Locating device..."
                        : geolocStatus === "success"
                        ? lang === "fr"
                          ? "Position acquise avec succès"
                          : "Location acquired"
                        : lang === "fr"
                        ? "Autoriser la géolocalisation"
                        : "Allow Geolocation"}
                    </span>
                  </button>

                  {errorMsg && (
                    <p className="text-[10px] text-red-400 leading-normal text-center">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <p className="text-[9px] text-slate-500 leading-normal text-center">
                    {lang === "fr"
                      ? "Vous pourrez toujours modifier votre ville ou votre rayon de recherche manuellement à tout moment depuis le menu de l'application."
                      : "You can change your city search query or radius at any time inside the main app dashboard."}
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    id="onboarding-back-btn"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 border border-white/10 hover:bg-white/5 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    {lang === "fr" ? "Retour" : "Back"}
                  </button>
                  <button
                    id="onboarding-finish-btn"
                    onClick={handleFinish}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-450 active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10"
                  >
                    <span>{lang === "fr" ? "Commencer !" : "Start exploring!"}</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
