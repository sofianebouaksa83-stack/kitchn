import { KitchNLoader } from "../../../components/Loading/KitchNLoader";

export function HomeLoadingLine() {
  return (
    <div className="flex items-center gap-2 text-sm text-white/50">
      <KitchNLoader className="kitchn-loader--mini" />
      Chargement...
    </div>
  );
}