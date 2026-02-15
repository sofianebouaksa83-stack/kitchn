import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { ui } from "../../styles/ui";

const MAX_MB = 10;
const ACCEPT = [".txt", ".md", ".doc", ".docx", ".pdf"];

export function ImportDropzone({
  onFile,
  onGoogleDrive,
  disabled,
}: {
  onFile: (file: File) => void;
  onGoogleDrive?: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  const pick = () => !disabled && inputRef.current?.click();

  const validate = (f: File) => {
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    const okExt = ACCEPT.includes(ext);
    const okSize = f.size <= MAX_MB * 1024 * 1024;
    return okExt && okSize;
  };

  const handleFile = (f?: File | null) => {
    if (!f || disabled) return;
    if (!validate(f)) return alert(`Fichier invalide. Formats: ${ACCEPT.join(", ")} • Max ${MAX_MB} MB`);
    onFile(f);
  };

  return (
    <div
      onDragEnter={(e) => (e.preventDefault(), !disabled && setIsOver(true))}
      onDragOver={(e) => (e.preventDefault(), !disabled && setIsOver(true))}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={[
        "rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md",
        "p-6 sm:p-8 transition relative",
        isOver ? "ring-2 ring-amber-400/70 border-amber-400/40 bg-slate-900/55" : "hover:border-white/20",
        disabled ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-14 w-14 rounded-2xl grid place-items-center bg-amber-400/15 border border-amber-400/25">
          <Upload className="w-7 h-7 text-amber-300" />
        </div>

        <div>
          <div className="text-slate-100 font-semibold">
            Glissez-déposez votre fichier ici
          </div>
          <div className="text-slate-400 text-sm">
            ou utilisez un des boutons ci-dessous
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={pick} className={`${ui.btnPrimary} px-4 py-2.5`}>
            Depuis ordinateur
          </button>

          <button
            onClick={onGoogleDrive}
            className={`${ui.btnGhost} px-4 py-2.5`}
            type="button"
          >
            Depuis Google Drive
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Formats: {ACCEPT.join(", ")} • Maximum {MAX_MB} MB
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT.join(",")}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
