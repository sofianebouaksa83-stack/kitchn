import type { ReactNode } from "react";
import { ui } from "../../styles/ui";

export function SectionCard({ children }: { children: ReactNode }) {
  return <div className={`${ui.card} rounded-3xl`}>{children}</div>;
}
