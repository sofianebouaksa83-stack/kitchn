import {
  AlertCircle,
  Shield,
} from "lucide-react";

type TeamAccessDeniedProps = {
  groupName?: string;
};

export function TeamAccessDenied({
  groupName,
}: TeamAccessDeniedProps) {
  return (
    <div
      className="
        mt-5
        rounded-[28px]
        border border-[#C05C56]/15
        bg-[#FBFAF6]
        p-7
        text-center
        shadow-[0_8px_24px_rgba(23,62,49,0.04)]
        sm:p-10
      "
    >
      <div
        className="
          mx-auto
          grid h-14 w-14
          place-items-center
          rounded-[20px]
          bg-[#F8EAE7]
          text-[#A54C48]
        "
      >
        <AlertCircle className="h-6 w-6" />
      </div>

      <h2
        className="
          mt-5
          font-serif
          text-xl
          font-semibold
          text-[#173E31]
        "
      >
        Accès limité
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-lg
          text-sm
          leading-relaxed
          text-[#718078]
        "
      >
        Seuls le{" "}
        <strong className="text-[#173E31]">
          Chef
        </strong>{" "}
        du groupe ou son{" "}
        <strong className="text-[#173E31]">
          Second
        </strong>{" "}
        peuvent gérer les membres et
        les invitations de{" "}
        <strong className="text-[#173E31]">
          {groupName ??
            "ce groupe"}
        </strong>
        .
      </p>

      <div
        className="
          mx-auto
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-[#F0F2EC]
          px-3 py-1.5
          text-xs
          font-medium
          text-[#617168]
        "
      >
        <Shield className="h-3.5 w-3.5" />
        Gestion réservée
      </div>
    </div>
  );
}