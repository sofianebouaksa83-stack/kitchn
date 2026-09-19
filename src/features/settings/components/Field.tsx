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
      <div
        className="
          flex items-end
          justify-between
          gap-3
        "
      >
        <div
          className="
            text-xs
            font-semibold
            text-[#29493E]
          "
        >
          {label}
        </div>

        {hint ? (
          <div
            className="
              text-xs
              text-[#8B9791]
            "
          >
            {hint}
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        {children}
      </div>

      {error ? (
        <div
          className="
            mt-1.5
            text-xs
            font-medium
            text-[#A54C48]
          "
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}