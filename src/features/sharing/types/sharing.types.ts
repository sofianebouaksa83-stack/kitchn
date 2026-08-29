export type GroupFolder = {
  id: string;
  group_id: string;
  name: string;
  created_by: string;
};

export type RecipeRow = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  is_favorite?: boolean;
  folder_id?: string | null;
};