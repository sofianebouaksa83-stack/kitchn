import React, { useEffect, useState } from "react";
import { Download, Share, Plus, X, ChefHat } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const STORAGE_KEY = "kitchn_add_to_home_dismissed";

function isMobileDevice() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /android|iphone|ipad|ipod/.test(userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    /iphone|ipad|ipod/i.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

function isStandaloneApp() {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export default function AddToHomePopup() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";

    if (dismissed || !isMobileDevice() || isStandaloneApp()) {
      return;
    }

    const ios = isIOSDevice();
    setIsIOS(ios);

    if (ios) {
      const timer = window.setTimeout(() => {
        setVisible(true);
      }, 1800);

      return () => window.clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      const installEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);

      window.setTimeout(() => {
        setVisible(true);
      }, 1200);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const closePopup = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      localStorage.setItem(STORAGE_KEY, "true");
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 md:hidden">
      <div className="relative overflow-hidden rounded-[28px] border border-[#D4AF37]/25 bg-[#0E1736]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/15 hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative pr-9">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.18)]">
              <ChefHat className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Ajouter Kitch’n à l’écran d’accueil
              </p>
              <p className="text-xs text-white/55">
                Accès rapide comme une vraie app
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-white/75">
                Sur iPhone, ouvre le menu de partage puis sélectionne{" "}
                <span className="font-semibold text-[#D4AF37]">
                  Ajouter à l’écran d’accueil
                </span>
                .
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Share className="h-4 w-4 text-[#D4AF37]" />
                  <span>Appuie sur Partager</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                  <Plus className="h-4 w-4 text-[#D4AF37]" />
                  <span>Choisis sur l’écran d’accueil</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closePopup}
                className="w-full rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/15 px-4 py-3 text-sm font-semibold text-[#F5D77A] transition active:scale-[0.98]"
              >
                J’ai compris
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-white/75">
                Installe Kitch’n sur ton téléphone pour l’ouvrir plus rapidement,
                sans chercher le site dans le navigateur.
              </p>

              <button
                type="button"
                onClick={installApp}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-4 py-3 text-sm font-bold text-[#0E1736] shadow-[0_12px_28px_rgba(212,175,55,0.24)] transition active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Ajouter l’app
              </button>

              <button
                type="button"
                onClick={closePopup}
                className="w-full rounded-2xl px-4 py-2 text-sm font-medium text-white/55 transition hover:text-white/80"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}