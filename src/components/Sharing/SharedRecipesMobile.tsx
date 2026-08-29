import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Folder } from "lucide-react";
import { SharedRecipeGroup } from "./SharedRecipeGroup";
import { KitchNLoader } from "../Loading/KitchNLoader";

type GroupMini = { id: string; name: string };

type SharedRecipesMobileProps = {
  recipeToOpen?: {
    recipeId: string;
    groupId: string;
  } | null;
  onRecipeOpened?: () => void;
};

function getPendingSharedOpen() {
  return {
    groupId:
      sessionStorage.getItem("selectedWorkGroupId") ||
      sessionStorage.getItem("selectedSharedGroupId"),
    recipeId: sessionStorage.getItem("selectedSharedRecipeId"),
  };
}

export function SharedRecipesMobile({
  recipeToOpen,
  onRecipeOpened,
}: SharedRecipesMobileProps) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupMini[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [recipeToOpenId, setRecipeToOpenId] = useState<string | null>(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!recipeToOpen) return;

    setSelectedGroupId(recipeToOpen.groupId);
    setRecipeToOpenId(recipeToOpen.recipeId);
  }, [recipeToOpen]);

  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      return;
    }

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

    const pending = recipeToOpen
      ? { groupId: recipeToOpen.groupId, recipeId: recipeToOpen.recipeId }
      : getPendingSharedOpen();

    if (pending.groupId) {
      setSelectedGroupId(pending.groupId);
      setRecipeToOpenId(pending.recipeId);
    }

    setLoading(false);
  }

  const selected = useMemo(
    () => (selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null),
    [groups, selectedGroupId]
  );

  if (loading) {
    return <KitchNLoader className="kitchn-loader--compact" />;
  }

  if (selectedGroupId) {
    return (
      <SharedRecipeGroup
        variant="mobile"
        groupId={selectedGroupId}
        groupName={selected?.name ?? "Groupe"}
        initialRecipeId={recipeToOpenId}
        onInitialRecipeOpened={() => {
          setRecipeToOpenId(null);
          sessionStorage.removeItem("selectedSharedRecipeId");
          sessionStorage.removeItem("selectedWorkGroupId");
          sessionStorage.removeItem("selectedSharedGroupId");
          onRecipeOpened?.();
        }}
        onBack={() => {
          setSelectedGroupId(null);
          setRecipeToOpenId(null);
        }}
      />
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-semibold text-slate-100 mb-2">Partagées</h1>
      <p className="text-sm text-slate-300/70 mb-6">Recettes visibles via tes groupes</p>

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
                <div className="text-lg font-semibold text-slate-100 truncate">{g.name}</div>
                <div className="text-sm text-slate-300/70">Ouvrir le groupe</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
