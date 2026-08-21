import React from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>

        {hint ? (
          <div className="text-xs text-white/50">{hint}</div>
        ) : null}
      </div>

      <div className="mt-2">{children}</div>

      {error ? (
        <div className="mt-1 text-xs text-red-200">{error}</div>
      ) : null}
    </div>
  );
}