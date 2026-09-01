import {
  BookOpen,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import type { NavItem } from "../types/navigation.types";

export const BASE_NAV_ITEMS: NavItem[] = [
  {
    key: "recipes",
    view: "recipes",
    label: "Mes recettes",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    key: "shared",
    view: "shared",
    label: "Partagées",
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    key: "groups",
    view: "groups",
    label: "Groupes",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "import-ai",
    view: "import-ai",
    label: "Import",
    icon: <Sparkles className="w-4 h-4" />,
  },
];