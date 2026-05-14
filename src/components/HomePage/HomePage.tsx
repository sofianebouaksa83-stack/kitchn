import React, { useEffect, useState } from "react";
import { BookOpen, Users, Sparkles, ArrowRight, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useSubscription } from "../../hooks/useSubscription";

const FREE_IMPORT_LIMIT = 30;

type HomePageProps = {
  navigateTo: (path: string) => void;
  openRecipe: (recipeId: string) => void;
  openSharedRecipe: (recipeId: string, groupId: string) => void;
};

type RecipeItem = Record<string, any>;
type SharedRecipeItem = {
  id: string;
  recipe_id: string;
  group_id: string;
  created_at?: string | null;
  recipe?: RecipeItem | null;
  group_name?: string | null;
};

export default function HomePage({ navigateTo, openRecipe, openSharedRecipe }: HomePageProps) {
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("Chef");
  const [recipesCount, setRecipesCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [importCount, setImportCount] = useState(0);
  const [latestRecipes, setLatestRecipes] = useState<RecipeItem[]>([]);
  const [latestSharedRecipes, setLatestSharedRecipes] = useState<SharedRecipeItem[]>([]);

  useEffect(() => {
    void loadHomeData();
    const refresh = () => void loadHomeData();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", () => !document.hidden && refresh());
    return () => window.removeEventListener("focus", refresh);
  }, [isPremium]);

  async function loadHomeData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setFirstName(user.user_metadata?.first_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Chef");
      const periodKey = new Date().toISOString().slice(0, 7);
      const [recipesData, recipesTotal, importUsageRes, memberGroupsRes] = await Promise.all([
        getMyLatestRecipes(user.id),
        getMyRecipesCount(user.id),
        supabase.from("ai_import_usage").select("import_count").eq("user_id", user.id).eq("period_key", periodKey).maybeSingle(),
        supabase.from("group_members").select("work_group_id").eq("user_id", user.id),
      ]);
      setLatestRecipes(recipesData);
      setRecipesCount(recipesTotal);
      setImportCount(importUsageRes.data?.import_count || 0);
      const groupIds = memberGroupsRes.data?.map((item: any) => item.work_group_id).filter(Boolean) || [];
      if (groupIds.length === 0) { setSharedCount(0); setLatestSharedRecipes([]); return; }
      const [sharedCountRes, latestShared] = await Promise.all([
        supabase.from("work_group_recipes").select("id", { count: "exact", head: true }).in("group_id", groupIds),
        getLatestSharedRecipes(groupIds),
      ]);
      setSharedCount(sharedCountRes.count || 0);
      setLatestSharedRecipes(latestShared);
    } finally { setLoading(false); }
  }

  async function getMyLatestRecipes(userId: string) {
    const { data, error } = await supabase.from("recipes").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
    if (error) return [];
    return data || [];
  }
  async function getMyRecipesCount(userId: string) {
    const { count, error } = await supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if (error) return 0;
    return count || 0;
  }
  async function getLatestSharedRecipes(groupIds: string[]) {
    const { data: sharedRows, error } = await supabase.from("work_group_recipes").select("*").in("group_id", groupIds).order("created_at", { ascending: false }).limit(5);
    if (error || !sharedRows?.length) return [];
    const recipeIds = sharedRows.map((row: any) => row.recipe_id).filter(Boolean);
    const workGroupIds = sharedRows.map((row: any) => row.group_id).filter(Boolean);
    const [recipesRes, groupsRes] = await Promise.all([
      supabase.from("recipes").select("*").in("id", recipeIds),
      supabase.from("work_groups").select("id, name").in("id", workGroupIds),
    ]);
    const recipesById = new Map((recipesRes.data || []).map((recipe: any) => [recipe.id, recipe]));
    const groupsById = new Map((groupsRes.data || []).map((group: any) => [group.id, group.name]));
    return sharedRows.map((row: any) => ({ id: row.id, recipe_id: row.recipe_id, group_id: row.group_id, created_at: row.created_at, recipe: recipesById.get(row.recipe_id) || null, group_name: groupsById.get(row.group_id) || "Groupe partagé" }));
  }

  const importValue = subscriptionLoading ? "..." : isPremium ? importCount : Math.max(FREE_IMPORT_LIMIT - importCount, 0);
  const importLabel = subscriptionLoading ? "Imports IA" : isPremium ? "Imports IA faits" : "Imports IA restants";
  return <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 text-white">
    <div><h1 className="mt-2 text-3xl font-bold">Bonjour <span className="text-[#D4AF37]">{firstName}</span></h1></div>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Résumé</h2><span className="text-sm text-white/45">Ce mois-ci</span></div><div className="grid gap-4 md:grid-cols-3"><StatCard icon={<BookOpen />} value={recipesCount} label="Recettes" /><StatCard icon={<Users />} value={sharedCount} label="Recettes partagées" /><StatCard icon={<Sparkles />} value={importValue} label={importLabel} /></div></section>
    <div className="grid gap-5 lg:grid-cols-2"><Panel title="Dernières recettes ajoutées" onClick={() => navigateTo("/recipes")}>{loading ? <LoadingLine /> : latestRecipes.length === 0 ? <EmptyLine text="Aucune recette récente pour le moment." /> : <div className="space-y-3">{latestRecipes.map((recipe) => <ListItem key={recipe.id} title={getRecipeTitle(recipe)} subtitle={getRecipeSubtitle(recipe)} onClick={() => openRecipe(recipe.id)} />)}</div>}</Panel><Panel title="Dernières recettes partagées" onClick={() => navigateTo("/shared")}>{loading ? <LoadingLine /> : latestSharedRecipes.length === 0 ? <EmptyLine text="Aucune recette partagée pour le moment." /> : <div className="space-y-3">{latestSharedRecipes.map((item) => <ListItem key={item.id} title={getRecipeTitle(item.recipe)} subtitle={item.group_name || "Groupe partagé"} onClick={() => openSharedRecipe(item.recipe_id, item.group_id)} />)}</div>}</Panel></div>
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]"><ChefHat className="h-7 w-7" /></div><div><p className="text-sm text-[#D4AF37]">Conseil du jour</p><h3 className="mt-1 text-xl font-semibold">Pense à centraliser tes anciennes recettes.</h3><p className="mt-1 text-sm text-white/55">L’import IA peut t’aider à tout regrouper au même endroit.</p></div></div></div>
  </div>;
}
function getRecipeTitle(recipe?: RecipeItem | null) { return recipe?.title || recipe?.recipe_name || recipe?.name || recipe?.nom || "Recette sans titre"; }
function getRecipeSubtitle(recipe?: RecipeItem | null) { return recipe?.category || recipe?.categorie || recipe?.type || recipe?.recipe_type || "Recette"; }
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) { return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">{icon}</div><div><p className="text-3xl font-bold">{value}</p><p className="text-sm text-white/55">{label}</p></div></div></div>; }
function Panel({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) { return <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"><div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClick} className="text-sm text-[#D4AF37]">Voir tout</button></div>{children}</div>; }
function ListItem({ title, subtitle, onClick }: { title: string; subtitle: string; onClick?: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-left transition hover:bg-white/[0.06]"><div className="min-w-0"><p className="line-clamp-2 font-medium text-white">{title}</p><p className="mt-1 text-sm text-white/45">{subtitle}</p></div><ArrowRight className="ml-3 h-4 w-4 shrink-0 text-white/35" /></button>; }
function EmptyLine({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">{text}</div>; }
function LoadingLine() { return <div className="flex items-center gap-2 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" />Chargement...</div>; }
