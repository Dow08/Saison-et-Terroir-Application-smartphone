import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ShieldCheck, X, CheckCircle } from "lucide-react";
import { Language } from "../types";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function PrivacyModal({ isOpen, onClose, lang }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="privacy-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="privacy-card"
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 text-white shadow-2xl relative my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Close Button */}
          <button
            id="privacy-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Shield glow backdrop */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mt-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === "fr" ? "Conformité Européenne RGPD" : "GDPR European Compliance"}
            </div>

            <h3 className="text-xl font-serif italic tracking-tight text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              {lang === "fr" ? "Protection des Données Personnelles" : "Personal Data Protection"}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === "fr"
                ? "Saison & Terroir applique les principes stricts du RGPD. Nous garantissons une transparence absolue sur l'usage de vos données :"
                : "Saison & Terroir implements the strict principles of GDPR. We guarantee complete transparency regarding your data:"}
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar text-xs text-slate-400 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">
                  {lang === "fr" ? "1. Aucune donnée stockée sur nos serveurs" : "1. No server-side storage"}
                </h4>
                <p>
                  {lang === "fr"
                    ? "Toutes vos recherches géographiques (villes, codes postaux, adresses exactes) ne sont utilisées que temporairement pour interroger l'API de géolocalisation Nominatim et générer des activités via Gemini. Elles ne sont jamais conservées."
                    : "All your location queries (cities, postal codes, exact addresses) are processed temporarily to query Nominatim and generate recommendations via Gemini. They are never kept."}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">
                  {lang === "fr" ? "2. Stockage local sécurisé (localStorage)" : "2. Secure client storage"}
                </h4>
                <p>
                  {lang === "fr"
                    ? "Vos favoris, vos notes d'agenda et vos préférences de pseudo sont stockés uniquement au sein de votre propre navigateur internet. Aucun cookie publicitaire ou pisteur n'est injecté."
                    : "Your favorites, agenda notes, and username preferences are stored solely on your device's browser via localStorage. No third-party tracking cookies are deployed."}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">
                  {lang === "fr" ? "3. Des sponsors contextualisés sans pistage" : "3. Non-tracking contextual ads"}
                </h4>
                <p>
                  {lang === "fr"
                    ? "Nos liens d'affiliation et offres de sponsors s'adaptent de façon entièrement dynamique en fonction de la localité recherchée, sans transmettre de données personnelles ou d'historique de recherche à des tiers."
                    : "Our affiliate links and sponsor offers adapt dynamically based on the searched city, without sharing your details or query history with partners."}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">
                  {lang === "fr" ? "4. Vos droits (Accès & Suppression)" : "4. Your rights"}
                </h4>
                <p>
                  {lang === "fr"
                    ? "Vous gardez le contrôle complet. Vous pouvez à tout moment vider le cache de votre navigateur pour supprimer définitivement toutes vos données locales de l'application."
                    : "You keep complete control. You can clear your browser storage at any time to instantly remove all data related to the application."}
                </p>
              </div>
            </div>

            <div className="bg-[#050505] p-3 rounded-xl border border-white/5 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {lang === "fr"
                  ? "Rassurez-vous, votre navigation sur Saison & Terroir est entièrement privée, économe en ressources et conforme à la loi européenne."
                  : "Rest assured, your navigation on Saison & Terroir is fully private, secure, and compliant with EU regulations."}
              </span>
            </div>

            <button
              id="btn-close-privacy"
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/15 uppercase tracking-wider"
            >
              {lang === "fr" ? "Fermer et retourner" : "Close and go back"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
