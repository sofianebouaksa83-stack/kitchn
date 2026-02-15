import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { X, Users, CheckCircle, AlertCircle } from "lucide-react";
import { ui } from "../../../styles/ui";

type GroupMini = { id: string; name: string };

type Props = {
  open: boolean;
  recipeId: string;
  onClose: () => void;
};

type MembershipRow = {
  work_group_id: string;
  work_groups: GroupMini | null;
};

export function RecipeGroupsModal({ open, recipeId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<GroupMini[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipeId]);

  async function load() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Non connecté");

      // 1) Groupes où je suis membre (via group_members)
      // ✅ FIX: column = work_group_id (pas group_id)
      const { data: membershipData, error: mErr } = await supabase
        .from("group_members")
        .select("work_group_id, work_groups:work_groups(id,name)")
        .eq("user_id", userId);

      if (mErr) throw mErr;

      // 2) Fallback : groupes que j’ai créés (owner)
      const { data: ownedGroups, error: oErr } = await supabase
        .from("work_groups")
        .select("id,name")
        .eq("created_by", userId);

      if (oErr) throw oErr;

      // Fusion + déduplication
      const map = new Map<string, GroupMini>();

      const list = (membershipData ?? []) as MembershipRow[];
      for (const row of list) {
        if (row.work_groups?.id) {
          map.set(row.work_groups.id, row.work_groups);
        } else if (row.work_group_id) {
          // si jamais l'embed ne remonte pas (FK/RLS), on garde l'id au moins
          map.set(String(row.work_group_id), {
            id: String(row.work_group_id),
            name: "Groupe",
          });
        }
      }

      for (const g of (ownedGroups ?? []) as GroupMini[]) {
        if (g?.id) map.set(g.id, g);
      }

      const g = Array.from(map.values()).sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "")
      );
      setGroups(g);

      // 3) Déjà partagée à quels groupes ?
      const { data: links, error: lErr } = await supabase
        .from("work_group_recipes")
        .select("group_id")
        .eq("recipe_id", recipeId);

      if (lErr) throw lErr;

      const sel: Record<string, boolean> = {};
      for (const grp of g) sel[grp.id] = false;

      for (const row of links ?? []) {
        const gid = String((row as any).group_id);
        if (gid) sel[gid] = true;
      }

      setSelected(sel);
    } catch (e: any) {
      setGroups([]);
      setSelected({});
      setStatus("error");
      setMessage(e?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  async function save() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // stratégie simple : remplacer les liens
      const { error: delErr } = await supabase
        .from("work_group_recipes")
        .delete()
        .eq("recipe_id", recipeId);

      if (delErr) throw delErr;

      if (selectedIds.length) {
        const payload = selectedIds.map((groupId) => ({
          recipe_id: recipeId,
          group_id: groupId,
        }));

        const { error: insErr } = await supabase
          .from("work_group_recipes")
          .insert(payload);

        if (insErr) throw insErr;
      }

      setStatus("success");
      setMessage("Partage mis à jour.");
      setTimeout(() => onClose(), 800);
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fermer"
        type="button"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />

          <div className="relative px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-slate-100 font-semibold flex items-center gap-2">
                <span className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                  <Users className="w-5 h-5 text-amber-200" />
                </span>
                Partager à un groupe
              </div>
              <div className="text-xs text-slate-300/70 mt-1">
                Coche les groupes qui doivent voir cette recette.
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 rounded-2xl inline-flex items-center justify-center hover:bg-white/[0.07] transition"
              aria-label="Fermer"
              type="button"
            >
              <X className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          <div className="relative p-5 space-y-4">
            {status === "success" && (
              <div className="rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex gap-3">
                <CheckCircle className="text-emerald-300" />
                <p className="text-emerald-200">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
                <AlertCircle className="text-red-300" />
                <p className="text-red-200">{message}</p>
              </div>
            )}

            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
              {groups.length === 0 ? (
                <div className="text-sm text-slate-300/70">
                  Aucun groupe trouvé. Crée un groupe dans l’onglet <b>Groupes</b>{" "}
                  puis reviens ici pour partager ta recette.
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-white/[0.05] transition cursor-pointer"
                    >
                      <div className="text-slate-100">{g.name}</div>
                      <input
                        type="checkbox"
                        checked={!!selected[g.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [g.id]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className={ui.btnGhost} type="button">
                Annuler
              </button>
              <button
                onClick={save}
                className={ui.btnPrimary}
                disabled={loading || groups.length === 0}
                type="button"
              >
                {loading ? "Sauvegarde…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
