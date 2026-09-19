import React from "react";

import {
  ArrowLeft,
  Scale,
} from "lucide-react";

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
    <div
      className="
        min-h-screen
        bg-[#F3F0E8]
        text-[#173E31]
        flex flex-col
      "
    >
      <div className="relative flex-1">
        <div
          className="
            mx-auto
            max-w-5xl
            px-4
            py-6
            sm:px-6
            sm:py-10
          "
        >
          {/* TOP BAR */}
          <div
            className="
              flex items-center
              justify-between
              gap-4
            "
          >
            <a
              href="/"
              className="
                inline-flex
                items-center
                transition
                hover:opacity-80
              "
            >
              <img
                src="/Logo_kitchn_horizontal.svg"
                alt="KITCH'N"
                className="
                  h-9
                  w-auto
                  sm:h-10
                "
                draggable={false}
              />
            </a>

            <a
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#E7EEE8]
                px-4 py-2.5
                text-sm
                font-medium
                text-[#184C3A]
                transition
                hover:bg-[#DDE8DF]
              "
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                Retour à l’accueil
              </span>

              <span className="sm:hidden">
                Retour
              </span>
            </a>
          </div>

          {/* HERO */}
          <div
            className="
              mx-auto
              mt-10
              max-w-3xl
              text-center
              sm:mt-14
            "
          >
            <div
              className="
                mx-auto
                grid h-12 w-12
                place-items-center
                rounded-[18px]
                bg-[#E7EEE8]
                text-[#184C3A]
                ring-1
                ring-[#173E31]/8
              "
            >
              <Scale className="h-5 w-5" />
            </div>

            <div
              className="
                mt-5
                inline-flex
                rounded-full
                bg-[#C7A45D]/12
                px-3.5 py-1.5
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#A8833E]
              "
            >
              {badge}
            </div>

            <h1
              className="
                mt-5
                font-serif
                text-3xl
                font-semibold
                tracking-tight
                text-[#173E31]
                sm:text-5xl
              "
            >
              {title}
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-[#718078]
                sm:text-base
              "
            >
              {intro}
            </p>
          </div>

          {/* CONTENT */}
          <div
            className="
              mt-10
              overflow-hidden
              rounded-[30px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              shadow-[0_12px_35px_rgba(23,62,49,0.05)]
              sm:mt-12
            "
          >
            <div
              className="
                px-5
                py-2
                sm:px-8
                sm:py-4
              "
            >
              {children}
            </div>
          </div>

          {/* FOOT NOTE */}
          <div
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-center
              text-xs
              leading-relaxed
              text-[#8B9791]
            "
          >
            Les informations présentes
            sur cette page peuvent être
            mises à jour afin de refléter
            les évolutions de Kitch’n et
            de ses services.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: SectionProps) {
  return (
    <section
      className="
        border-b
        border-[#173E31]/8
        py-6
        last:border-b-0
        sm:py-7
      "
    >
      <h2
        className="
          font-serif
          text-lg
          font-semibold
          text-[#173E31]
          sm:text-xl
        "
      >
        {title}
      </h2>

      <div
        className="
          mt-3
          text-sm
          leading-7
          text-[#617168]
          sm:text-base
        "
      >
        {children}
      </div>
    </section>
  );
}