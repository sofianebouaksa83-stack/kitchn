import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Share2, Folder } from "lucide-react";
import { SharedRecipeGroup } from "./SharedRecipeGroup";

type GroupMini = { id: string; name: string };

export function SharedRecipesMobile() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupMini[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setLoading(false);

    const { data } = await supabase
      .from("group_members")
      .select("work_groups(id,name)")
      .eq("user_id", auth.user.id);

    const list =
      data
        ?.map((r: any) => r.work_groups)
        .filter(Boolean)
        .sort((a: any, b: any) => a.name.localeCompare(b.name)) ?? [];

    setGroups(list);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-slate-300">
        Chargement…
      </div>
    );
  }
const selected = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;

if (selectedGroupId) {
  return (
    <SharedRecipeGroup
      groupId={selectedGroupId}
      groupName={selected?.name ?? "Groupe"}
      onBack={() => setSelectedGroupId(null)}
    />
  );
}

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-semibold text-slate-100 mb-2">
        Partagées
      </h1>
      <p className="text-sm text-slate-300/70 mb-6">
        Recettes visibles via tes groupes
      </p>

      <div className="space-y-4">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className="w-full rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 text-left"
            type="button"
          >
            <div className="flex items-center gap-3">
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
          </button>
        ))}
      </div>
    </div>
  );
}
