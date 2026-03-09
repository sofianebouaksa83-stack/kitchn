import React from "react";
import { Footer } from "../Layout/Footer";

type LegalLayoutProps = {
  badge: string;
  title: string;
  intro: string;
  children: React.ReactNode;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalLayout({
  badge,
  title,
  intro,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-24 right-[-140px] h-[440px] w-[440px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="inline-flex items-center gap-3">
              <img
                src="/Logo_kitchn_horizontal.svg"
                alt="KITCH'N"
                className="h-10 sm:h-11 w-auto"
                draggable={false}
              />
            </a>

            <a
              href="/"
              className="text-sm text-white/60 hover:text-white transition"
            >
              Retour à l’accueil
            </a>
          </div>

          <div className="mt-12 text-center max-w-3xl mx-auto">
            <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300">
              {badge}
            </div>

            <h1 className="mt-6 text-3xl sm:text-5xl font-semibold tracking-tight">
              {title}
            </h1>

            <p className="mt-4 text-white/65 text-base sm:text-lg leading-7">
              {intro}
            </p>
          </div>

          <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="p-6 sm:p-10">{children}</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: SectionProps) {
  return (
    <section className="py-6 border-b border-white/8 last:border-b-0">
      <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 text-white/75 leading-7 text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
}