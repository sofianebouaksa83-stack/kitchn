import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Share2, Folder } from "lucide-react";
import { ui } from "../../styles/ui";
import { SharedRecipeGroup } from "./SharedRecipeGroup";

type GroupMini = { id: string; name: string };

type MembershipRow = {
  work_group_id: string;
  work_groups: GroupMini | null;
};

export function SharedRecipesDesktop() {
  const [loading, setLoading] = useState(true);

  const [userGroups, setUserGroups] = useState<GroupMini[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    void loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGroups() {
    setLoading(true);

    try {
      // 1) user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) {
        setUserGroups([]);
        setSelectedGroupId(null);
        return;
      }

      // 2) groupes de l'utilisateur
      // ✅ FIX: work_group_id au lieu de group_id
      const { data: membershipsData, error: membershipsError } = await supabase
        .from("group_members")
        .select("work_group_id, work_groups:work_groups(id,name)")
        .eq("user_id", userId);

      if (membershipsError) throw membershipsError;

      const memberships = (membershipsData ?? []) as MembershipRow[];

      const groups = memberships
        .map((row) => row.work_groups)
        .filter((g): g is GroupMini => Boolean(g?.id))
        .sort((a, b) => a.name.localeCompare(b.name));

      setUserGroups(groups);

      // UX: si 1 seul groupe -> auto-entrer
      if (groups.length === 1) setSelectedGroupId(groups[0].id);
      else setSelectedGroupId(null);
    } catch (err: any) {
      console.error("[SharedRecipes] Error loading groups:", err);
      setUserGroups([]);
      setSelectedGroupId(null);
    } finally {
      setLoading(false);
    }
  }

  const selectedGroup = useMemo(
    () =>
      selectedGroupId
        ? userGroups.find((g) => g.id === selectedGroupId) ?? null
        : null,
    [selectedGroupId, userGroups]
  );

  // ✅ Vue “dans un groupe”
  if (!loading && selectedGroupId) {
    return (
      <SharedRecipeGroup
        groupId={selectedGroupId}
        groupName={selectedGroup?.name ?? "Groupe"}
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  const emptyState = !loading && userGroups.length === 0;

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        {/* Header (plein écran) */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <Share2 className="w-5 h-5 text-amber-200" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Partagées
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Recettes visibles via tes groupes de travail
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-8 flex items-center justify-center h-64">
              <div className="text-slate-300/80">Chargement…</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && emptyState && (
            <div className="mt-8 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <Share2 className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">
                Tu n’es dans aucun groupe pour le moment
              </p>
              <p className="text-sm text-slate-300/70 mt-2">
                Demande une invitation ou crée un groupe.
              </p>
            </div>
          )}

          {/* List */}
          {!loading && !emptyState && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {userGroups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  title={`Ouvrir ${g.name}`}
                  type="button"
                  className={[
                    "text-left",
                    "relative rounded-3xl border ring-1 overflow-hidden",
                    "border-white/10 ring-white/10 bg-white/[0.06]",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                    "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                        <Folder className="w-5 h-5 text-amber-200" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-slate-100 truncate">
                          {g.name}
                        </div>
                        <div className="text-sm text-slate-300/70">
                          Ouvrir le groupe
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
