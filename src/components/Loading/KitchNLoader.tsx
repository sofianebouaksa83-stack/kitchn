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
      {/* Halo lumineux de fond */}
      <div className="kitchn-loader__ambient" aria-hidden="true" />

      <div className="kitchn-loader__content">
        {/* TOQUE */}
        <div className="kitchn-loader__hat" aria-hidden="true">
          {/* Toque sans les 3 traits */}
          <img
            className="kitchn-loader__hat-base"
            src="/toque_sans_wave.png"
            alt=""
            draggable={false}
          />

          {/* Trait gauche */}
          <img
            className="kitchn-loader__wave kitchn-loader__wave--left"
            src="/toque_wave_1.png"
            alt=""
            draggable={false}
          />

          {/* Trait central */}
          <img
            className="kitchn-loader__wave kitchn-loader__wave--center"
            src="/toque_wave_2.png"
            alt=""
            draggable={false}
          />

          {/* Trait droit */}
          <img
            className="kitchn-loader__wave kitchn-loader__wave--right"
            src="/toque_wave_3.png"
            alt=""
            draggable={false}
          />

          {/*
            Image finale utilisée principalement pour
            prefers-reduced-motion.
          */}
          <img
            className="kitchn-loader__hat-complete"
            src="/toque_entier.png"
            alt=""
            draggable={false}
          />
        </div>

        {/* NOM */}
        <div className="kitchn-loader__wordmark" aria-hidden="true">
          KITCH’N
        </div>
      </div>

      <span className="sr-only">
        Préparation de votre espace KITCH'N…
      </span>
    </div>
  );
}