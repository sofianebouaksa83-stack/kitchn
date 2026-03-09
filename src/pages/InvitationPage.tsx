import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

import {
  AlertCircle,
  CheckCircle2,
  Loader,
  Users,
  Mail,
  ShieldCheck,
  Clock,
  LogIn,
} from "lucide-react";

import { PageShell } from "../components/Layout/PageShell";
import { ui } from "../styles/ui";

type InvitePublicRow = {
  work_group_id: string | null;
  work_group_name: string | null;
  role: string | null;
  email: string | null;
  expires_at: string | null;
  accepted_at: string | null;
};

function getInvitationToken() {
  const path = window.location.pathname;

  if (path.startsWith("/invitation/")) {
    return path.replace("/invitation/", "").trim();
  }

  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("/invitation/")) {
    return hash.replace("/invitation/", "").trim();
  }

  return null;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const n = name.length <= 2 ? name[0] + "*" : name.slice(0, 2) + "***";
  return `${n}@${domain}`;
}

function roleLabel(role: string | null) {
  const r = (role ?? "").toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "chef") return "Chef";
  if (r === "second") return "Second";
  if (r === "chef_de_partie") return "Chef de partie";
  if (r === "commis") return "Commis";
  return role ?? "Membre";
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function InvitationPage() {
  const token = getInvitationToken();
  const { user } = useAuth();

  const [state, setState] = useState<
    "loading" | "ready" | "accepted" | "expired" | "invalid" | "joining"
  >("loading");
  const [err, setErr] = useState<string | null>(null);
  const [inv, setInv] = useState<InvitePublicRow | null>(null);

  const maskedEmail = useMemo(() => {
    if (!inv?.email) return null;
    return maskEmail(inv.email);
  }, [inv?.email]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr(null);
        setState("loading");

        if (!token) {
          setInv(null);
          setState("invalid");
          return;
        }

        const { data, error } = await supabase.rpc("get_public_invitation", {
          invitation_token: token,
        });

        if (error) throw error;

        const row = (Array.isArray(data) ? data[0] : data) as
          | InvitePublicRow
          | undefined;

        if (!row || !row.work_group_id) {
          if (!alive) return;
          setInv(null);
          setState("invalid");
          return;
        }

        if (!alive) return;
        setInv(row);

        if (row.accepted_at) {
          setState("accepted");
          return;
        }
        if (isExpired(row.expires_at)) {
          setState("expired");
          return;
        }

        setState("ready");
      } catch (e: any) {
        if (!alive) return;
        setInv(null);
        setState("invalid");
        setErr(e?.message ?? "Invitation invalide.");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token]);

  function goLogin() {
    // ✅ on garde le retour vers l’invitation (hash router)
    if (token) window.location.hash = `/login?redirect=/invitation/${token}`;
    else window.location.hash = "/login";
  }

  async function onAccept() {
    setErr(null);

    if (!token) {
      setState("invalid");
      return;
    }

    if (!user) {
      goLogin();
      return;
    }

    try {
      setState("joining");

const { data, error } = await supabase.rpc("accept_group_invitation", {
  invitation_token: token,
});

if (error) throw error;

const payload = data as any;
if (!payload?.success) throw new Error("Impossible d'accepter l'invitation.");

// ✅ redirige vers groupes
window.location.hash = "/groups";

      if (error) throw error;

      // ✅ ton app utilise des views -> /groups suffit
      window.location.hash = "/groups";
    } catch (e: any) {
      setState("ready");
      setErr(e?.message ?? "Impossible d'accepter l'invitation.");
    }
  }

  return (
    <PageShell
      title="Invitation"
      subtitle="Rejoindre un groupe de travail"
      icon={<Users size={18} />}
    >
      <div className="mx-auto w-full max-w-xl">
        <div
          className={[
            ui.cardGlass,
            "p-4 sm:p-6",
            "space-y-4 sm:space-y-5",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-white/10 ring-1 ring-white/10 p-2">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold">
                Invitation de groupe
              </div>
              <div className="text-sm text-white/60">
                Lien sécurisé • Token unique
              </div>
            </div>
          </div>

          {/* Body states */}
          {state === "loading" && (
            <div className="flex items-center gap-2 text-white/80">
              <Loader className="animate-spin" size={18} />
              Chargement…
            </div>
          )}

          {state === "invalid" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle size={18} />
                Invitation invalide ou introuvable.
              </div>
              {err && <div className="text-xs text-white/55">{err}</div>}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className={ui.buttonSecondary}
                  onClick={() => (window.location.hash = "/")}
                >
                  Retour à l’accueil
                </button>
                <button className={ui.buttonPrimary} onClick={goLogin}>
                  <LogIn size={16} />
                  Se connecter
                </button>
              </div>
            </div>
          )}

          {(state === "ready" ||
            state === "accepted" ||
            state === "expired" ||
            state === "joining") &&
            inv && (
              <div className="space-y-4">
                {/* Group card */}
                <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-4">
                  <div className="text-xs text-white/60">Groupe</div>
                  <div className="mt-0.5 text-lg sm:text-xl font-semibold truncate">
                    {inv.work_group_name ?? "Groupe"}
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                      <Users size={16} className="text-white/70" />
                      <div className="text-sm">
                        Rôle :{" "}
                        <span className="text-white/90 font-medium">
                          {roleLabel(inv.role)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                      <Mail size={16} className="text-white/70" />
                      <div className="text-sm truncate">
                        {maskedEmail ? (
                          <>
                            Envoyée à{" "}
                            <span className="text-white/90 font-medium">
                              {maskedEmail}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/70">
                            Invitation privée
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {inv.expires_at && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
                      <Clock size={14} />
                      Expire le{" "}
                      {new Date(inv.expires_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                {/* Status + Actions */}
                {state === "accepted" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 size={18} />
                      Invitation déjà acceptée.
                    </div>
                    <button
                      className={ui.buttonPrimary}
                      onClick={() => (window.location.hash = "/groups")}
                    >
                      Aller à mes groupes
                    </button>
                  </div>
                )}

                {state === "expired" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-200">
                      <AlertCircle size={18} />
                      Cette invitation a expiré.
                    </div>
                    <div className="text-sm text-white/60">
                      Demande au chef de te renvoyer une invitation.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className={ui.buttonSecondary}
                        onClick={() => (window.location.hash = "/")}
                      >
                        Retour
                      </button>
                      <button className={ui.buttonPrimary} onClick={goLogin}>
                        <LogIn size={16} />
                        Se connecter
                      </button>
                    </div>
                  </div>
                )}

                {(state === "ready" || state === "joining") && (
                  <div className="space-y-3">
                    {!user ? (
                      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="text-sm font-medium">
                          Tu dois être connecté pour rejoindre ce groupe.
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          Après connexion, tu reviens automatiquement ici.
                        </div>
                        <button
                          className={[ui.buttonPrimary, "mt-3 w-full"].join(" ")}
                          onClick={goLogin}
                        >
                          <LogIn size={16} />
                          Se connecter / Créer un compte
                        </button>
                      </div>
                    ) : (
                      <button
                        className={[ui.buttonPrimary, "w-full"].join(" ")}
                        onClick={onAccept}
                        disabled={state === "joining"}
                      >
                        {state === "joining" ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            Rejoindre…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Rejoindre le groupe
                          </>
                        )}
                      </button>
                    )}

                    {err && (
                      <div className="flex items-center gap-2 text-red-300">
                        <AlertCircle size={18} />
                        <span className="text-sm">{err}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>

        <div className="h-6 sm:h-10" />
      </div>
    </PageShell>
  );
}