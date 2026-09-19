import type { ReactNode } from "react";

import { KitchNLoader } from "../components/Loading/KitchNLoader";

export default function LoaderPreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F3F0E8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        padding: "48px 20px",
        color: "#173E31",
      }}
    >
      {/* TITRE */}
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#A8833E",
          }}
        >
          Kitch’n Design System
        </div>

        <h1
          style={{
            margin: 0,
            color: "#173E31",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "38px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Loader KITCH’N
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#718078",
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
          }}
        >
          Preview du nouveau loader
        </p>
      </div>

      {/* PREVIEW PRINCIPALE */}
      <section
        style={{
          width: "min(100%, 700px)",
          overflow: "hidden",
          borderRadius: "32px",
          border: "1px solid rgba(23, 62, 49, 0.10)",
          background: "#FBFAF6",
          boxShadow: "0 24px 70px rgba(23, 62, 49, 0.08)",
        }}
      >
        <KitchNLoader className="kitchn-loader--preview" />
      </section>

      {/* AUTRES VERSIONS */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          width: "min(100%, 700px)",
        }}
      >
        <PreviewCard
          title="Compact"
          description="Chargement d’une section"
        >
          <KitchNLoader className="kitchn-loader--compact" />
        </PreviewCard>

        <PreviewCard
          title="Mini"
          description="Boutons et petites actions"
        >
          <KitchNLoader className="kitchn-loader--mini" />
        </PreviewCard>
      </div>

      {/* INFO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "999px",
          background: "#E7EEE8",
          border: "1px solid rgba(23, 62, 49, 0.08)",
          color: "#617168",
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "999px",
            background: "#C7A45D",
          }}
        />

        Recharge la page pour rejouer l’animation
      </div>
    </main>
  );
}

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        flex: "1 1 260px",
        minWidth: "220px",
        overflow: "hidden",
        borderRadius: "24px",
        background: "#FBFAF6",
        border: "1px solid rgba(23, 62, 49, 0.10)",
        boxShadow: "0 12px 35px rgba(23, 62, 49, 0.05)",
      }}
    >
      <div
        style={{
          minHeight: "150px",
          display: "grid",
          placeItems: "center",
          padding: "16px",
          background:
            "radial-gradient(circle at center, rgba(231, 238, 232, 0.65), transparent 70%)",
        }}
      >
        {children}
      </div>

      <div
        style={{
          padding: "16px 18px 18px",
          borderTop: "1px solid rgba(23, 62, 49, 0.08)",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "17px",
            fontWeight: 600,
            color: "#173E31",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "4px",
            fontFamily: "system-ui, sans-serif",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#8B9791",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}