import { KitchNLoader } from "../components/Loading/KitchNLoader";

export default function LoaderPreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#070b16",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        padding: "40px 20px",
        color: "#e8bc59",
      }}
    >
      {/* TITRE */}
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            color: "#e8bc59",
            fontFamily: "system-ui, sans-serif",
            fontSize: "36px",
            fontWeight: 500,
            letterSpacing: "0.12em",
          }}
        >
          KITCH’N
        </h1>

        <p
          style={{
            color: "#ffffff",
            opacity: 0.5,
            marginTop: "8px",
          }}
        >
          Preview du loader
        </p>
      </div>

      {/* PREVIEW PRINCIPALE */}
      <section
        style={{
          width: "min(100%, 700px)",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(232, 188, 89, 0.12)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.35)",
        }}
      >
        <KitchNLoader className="kitchn-loader--preview" />
      </section>

      {/* AUTRES VERSIONS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        <PreviewCard title="Compact">
          <KitchNLoader className="kitchn-loader--compact" />
        </PreviewCard>

        <PreviewCard title="Mini">
          <KitchNLoader className="kitchn-loader--mini" />
        </PreviewCard>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#ffffff",
          opacity: 0.35,
        }}
      >
        Recharge la page pour rejouer l’animation
      </p>
    </main>
  );
}

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minWidth: "180px",
        padding: "20px",
        borderRadius: "18px",
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.025)",
        border: "1px solid rgba(232, 188, 89, 0.1)",
      }}
    >
      <div
        style={{
          minHeight: "120px",
          display: "grid",
          placeItems: "center",
        }}
      >
        {children}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "13px",
          color: "#ffffff",
          opacity: 0.5,
        }}
      >
        {title}
      </div>
    </div>
  );
}