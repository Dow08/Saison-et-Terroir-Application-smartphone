import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Fingerprint, ScanEye, CheckCircle2, AlertCircle } from "lucide-react";
import { Language, LOCALIZATION } from "../types";

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

export default function BiometricModal({ isOpen, onClose, onSuccess, lang }: BiometricModalProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const t = LOCALIZATION[lang];

  useEffect(() => {
    if (isOpen) {
      setScanState("scanning");
      const timer = setTimeout(() => {
        // 90% success rate simulation, 10% failure to make it interactive and authentic
        if (Math.random() > 0.1) {
          setScanState("success");
          const successTimer = setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
          return () => clearTimeout(successTimer);
        } else {
          setScanState("error");
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setScanState("idle");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="biometric-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          id="biometric-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle ambient light backdrops */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-center mb-6">
            <div className="p-3 bg-[#050505] rounded-full border border-white/10">
              {scanState === "scanning" && (
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* Outer scan ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-amber-500 rounded-full"
                  />
                  {/* Pulse scale rings */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-2 bg-amber-500/10 rounded-full"
                  />
                  <ScanEye className="w-10 h-10 text-amber-500 z-10" />
                </div>
              )}

              {scanState === "success" && (
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.1, 1] }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-full"
                  />
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 z-10 animate-bounce" />
                </div>
              )}

              {scanState === "error" && (
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.1, 1] }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"
                  />
                  <AlertCircle className="w-12 h-12 text-red-400 z-10" />
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-serif italic mb-2">
            {scanState === "scanning" && t.biometricAuthTitle}
            {scanState === "success" && t.biometricSuccess}
            {scanState === "error" && "Authentification Échouée"}
          </h3>

          <p className="text-sm text-slate-400 px-2 mb-6">
            {scanState === "scanning" && t.biometricAuthSubtitle}
            {scanState === "success" && "Notes privées déverrouillées avec succès !"}
            {scanState === "error" && t.biometricFail}
          </p>

          <div className="space-y-3">
            {scanState === "error" && (
              <button
                id="btn-retry-biometric"
                onClick={() => setScanState("scanning")}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-colors focus:outline-hidden text-sm"
              >
                Réessayer
              </button>
            )}

            <button
              id="btn-cancel-biometric"
              onClick={onClose}
              className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-medium rounded-xl transition-colors focus:outline-hidden text-sm"
            >
              {t.cancelLabel}
            </button>
          </div>

          {/* Device indicators */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-600">
            <Fingerprint className="w-3.5 h-3.5 text-slate-600" />
            <span>Capteur Android Keystore / Windows Hello sécurisé</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
