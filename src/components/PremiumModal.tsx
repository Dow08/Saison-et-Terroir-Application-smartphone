import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, X, ShieldCheck, CreditCard } from "lucide-react";
import { Language, LOCALIZATION } from "../types";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  lang: Language;
}

export default function PremiumModal({ isOpen, onClose, onUpgradeSuccess, lang }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"pricing" | "card">("pricing");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const t = LOCALIZATION[lang];

  const handleCheckout = () => {
    setStep("card");
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating instant checkout
    setTimeout(() => {
      setLoading(false);
      onUpgradeSuccess();
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="premium-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          id="premium-card"
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 text-white shadow-2xl relative my-8"
        >
          {/* Header Close Button */}
          <button
            id="premium-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sparkly glow backdrop */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {step === "pricing" ? (
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-4 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Experience
              </div>

              <h3 className="text-2xl font-serif italic tracking-tight mb-2 text-white">
                {t.premiumUnlockTitle}
              </h3>
              <p className="text-sm text-slate-300 mb-6 px-2 font-sans">
                {t.premiumUnlockDesc}
              </p>

              {/* Price Tag */}
              <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 mb-6">
                <div className="text-3xl font-serif italic font-extrabold text-amber-500">
                  4,99 € <span className="text-sm text-slate-400 font-normal">/ mois</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Annulation en un clic à tout moment</div>
              </div>

              {/* Features List */}
              <div className="space-y-3.5 text-left mb-8 px-2 font-sans">
                {t.premiumFeaturesList.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                    <div className="p-0.5 bg-amber-500/10 rounded-full border border-amber-500/20 shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-amber-400" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                id="btn-subscribe-premium"
                onClick={handleCheckout}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-650 hover:from-amber-450 hover:to-amber-600 text-black font-bold text-base rounded-xl transition-all shadow-lg shadow-amber-500/15"
              >
                {t.subscribeButton}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Paiement 100% Sécurisé & Crypté SSL</span>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-serif italic mb-4 flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Détails du Paiement
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-sans">
                Saisissez vos coordonnées de carte bancaire pour finaliser votre abonnement de <strong className="text-white">4,99 € / mois</strong>.
              </p>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Numéro de carte
                  </label>
                  <input
                    id="card-number-input"
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      // Formatting with spaces
                      const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                      const matches = v.match(/\d{4,16}/g);
                      const match = (matches && matches[0]) || "";
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(" "));
                      } else {
                        setCardNumber(v);
                      }
                    }}
                    className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Date d'expiration
                    </label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^0-9]/g, "");
                        if (v.length >= 2) {
                          v = v.substring(0, 2) + "/" + v.substring(2, 4);
                        }
                        setExpiry(v);
                      }}
                      className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Code CVC / CVV
                    </label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-[#050505] border border-white/10 focus:border-amber-500/50 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-hidden text-center"
                    />
                  </div>
                </div>

                {/* Simulated subscription details */}
                <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  En confirmant, vous autorisez Saison & Terroir à prélever automatiquement 4,99 € chaque mois sur cette carte. Vous pouvez résilier cet abonnement instantanément depuis vos paramètres sans frais supplémentaires.
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    id="btn-back-pricing"
                    type="button"
                    onClick={() => setStep("pricing")}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-sm border border-white/10 transition-all"
                  >
                    Retour
                  </button>
                  <button
                    id="btn-confirm-payment"
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-black font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Confirmer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
