import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ui } from "../../styles/ui";
import { GlassPanel } from "../../styles/ui/GlassPanel";
import { Loader, AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthCallback() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("Validation du lien…");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        if (error) throw error;

        if (!alive) return;
        setState("ok");
        setMsg("Connexion confirmée ✅ Redirection…");

        // ✅ Redirection immédiate et fiable vers ton routing hash
        window.location.replace("/#/");
        return;
      } catch (e: any) {
        if (!alive) return;
        setState("error");
        setMsg(e?.message ?? "Impossible de confirmer le compte.");
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={`${ui.pageBg} relative min-h-screen`}>
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[560px]">
          <GlassPanel className="overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src="/Logo_kitchn_horizontal.svg"
                  alt="KITCH'N"
                  className="h-11 sm:h-12 w-auto select-none"
                  draggable={false}
                />
                <p className="text-sm text-slate-200/80">Connexion Google</p>
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                {state === "loading" && (
                  <Loader className="h-5 w-5 animate-spin text-yellow-300 mt-0.5" />
                )}
                {state === "ok" && (
                  <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                )}
                {state === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-300 mt-0.5" />
                )}
                <div>
                  <div className="text-slate-100 font-semibold">
                    {state === "loading"
                      ? "Validation…"
                      : state === "ok"
                      ? "C’est bon !"
                      : "Erreur"}
                  </div>
                  <div className="text-sm text-slate-200/80 mt-1">{msg}</div>

                  {state === "error" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => (window.location.hash = "/login")}
                        className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm text-slate-100"
                      >
                        Retour connexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}