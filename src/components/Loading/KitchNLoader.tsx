import "./KitchNLoader.css";

type KitchNLoaderProps = {
  className?: string;
};

export function KitchNLoader({ className = "" }: KitchNLoaderProps) {
  return (
    <div
      className={["kitchn-loader", className].filter(Boolean).join(" ")}
      data-testid="kitchn-loader"
      role="status"
      aria-live="polite"
      aria-label="Chargement de KITCH'N"
    >
      <div className="kitchn-loader__ambient" aria-hidden="true" />

      <div className="kitchn-loader__reveal">
        <div className="kitchn-loader__breath">
          <img
            className="kitchn-loader__logo"
            src="/toque-premium.png"
            alt="KITCH'N"
            draggable={false}
          />
        </div>
      </div>

      <span className="sr-only">Préparation de votre espace KITCH'N…</span>
    </div>
  );
}
