// src/styles/ui.ts

export const ui = {
  // ─────────────────────────────
  // BACKGROUNDS
  // ─────────────────────────────

  pageBg:
    "min-h-screen bg-[#F3F0E8] text-[#173E31]",

  dashboardBg:
    "min-h-screen bg-[#F3F0E8] text-[#173E31]",

  // ─────────────────────────────
  // LAYOUT
  // ─────────────────────────────

  container:
    "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",

  containerWide:
    "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8",

  page:
    "max-w-7xl mx-auto p-4 sm:p-6",

  // ─────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────

  title:
    "text-2xl sm:text-3xl font-semibold tracking-tight text-[#173E31]",

  subtitle:
    "text-sm sm:text-base text-[#607168]",

  muted:
    "text-sm text-[#7A8981]",

  // ─────────────────────────────
  // SURFACES
  // ─────────────────────────────

  glassPanel:
    "bg-[#FBFAF6] border border-[#173E31]/10 rounded-[28px] " +
    "shadow-[0_12px_35px_rgba(23,62,49,0.06)]",

  card:
    "bg-[#FBFAF6] border border-[#173E31]/10 rounded-2xl " +
    "shadow-[0_10px_30px_rgba(23,62,49,0.05)] " +
    "transition-all duration-200 " +
    "hover:-translate-y-0.5 hover:border-[#173E31]/20 " +
    "hover:shadow-[0_14px_35px_rgba(23,62,49,0.08)]",

  cardSoft:
    "bg-[#E7EEE8] border border-[#173E31]/10 rounded-2xl " +
    "shadow-[0_8px_24px_rgba(23,62,49,0.04)]",

  // ─────────────────────────────
  // FORMS
  // ─────────────────────────────

  input:
    "w-full h-11 px-4 rounded-2xl " +
    "bg-[#FBFAF6] border border-[#173E31]/15 " +
    "text-[#173E31] placeholder:text-[#7A8981] " +
    "transition-all duration-200 " +
    "hover:border-[#173E31]/25 " +
    "focus:outline-none focus:ring-2 focus:ring-[#C7A45D]/25 " +
    "focus:border-[#C7A45D]/50",

  textarea:
    "w-full min-h-[120px] px-4 py-3 rounded-2xl " +
    "bg-[#FBFAF6] border border-[#173E31]/15 " +
    "text-[#173E31] placeholder:text-[#7A8981] " +
    "transition-all duration-200 " +
    "hover:border-[#173E31]/25 " +
    "focus:outline-none focus:ring-2 focus:ring-[#C7A45D]/25 " +
    "focus:border-[#C7A45D]/50",

  inputSoft:
    "w-full h-11 px-4 rounded-2xl " +
    "bg-[#E7EEE8] border border-[#173E31]/10 " +
    "text-[#173E31] placeholder:text-[#7A8981] " +
    "transition-all duration-200 " +
    "hover:border-[#173E31]/20 " +
    "focus:outline-none focus:ring-2 focus:ring-[#C7A45D]/25 " +
    "focus:border-[#C7A45D]/50",

  textareaSoft:
    "w-full min-h-[120px] px-4 py-3 rounded-2xl " +
    "bg-[#E7EEE8] border border-[#173E31]/10 " +
    "text-[#173E31] placeholder:text-[#7A8981] " +
    "transition-all duration-200 " +
    "hover:border-[#173E31]/20 " +
    "focus:outline-none focus:ring-2 focus:ring-[#C7A45D]/25 " +
    "focus:border-[#C7A45D]/50",

  selectSoft:
    "w-full h-11 px-4 rounded-2xl " +
    "bg-[#E7EEE8] border border-[#173E31]/10 " +
    "text-[#173E31] " +
    "transition-all duration-200 " +
    "hover:border-[#173E31]/20 " +
    "focus:outline-none focus:ring-2 focus:ring-[#C7A45D]/25 " +
    "focus:border-[#C7A45D]/50",

  // ─────────────────────────────
  // BUTTONS
  // ─────────────────────────────

  btnPrimary:
    "inline-flex items-center justify-center gap-2 " +
    "px-5 py-2.5 rounded-full font-semibold " +
    "bg-[#DDAE9D] text-[#173E31] " +
    "border border-[#DDAE9D] " +
    "shadow-[0_8px_22px_rgba(120,73,57,0.10)] " +
    "transition-all duration-200 " +
    "hover:bg-[#D5A18E] hover:-translate-y-0.5 " +
    "active:scale-[0.98]",

  btnGhost:
    "inline-flex items-center justify-center gap-2 " +
    "px-4 py-2.5 rounded-full font-medium " +
    "text-[#173E31] " +
    "hover:bg-[#E7EEE8] " +
    "transition-all duration-200 active:scale-[0.98]",

  btnDark:
    "inline-flex items-center justify-center gap-2 " +
    "px-5 py-2.5 rounded-full font-medium " +
    "bg-[#184C3A] text-[#F7F3EA] " +
    "border border-[#184C3A] " +
    "hover:bg-[#123C2E] " +
    "transition-all duration-200 active:scale-[0.98]",

  // ─────────────────────────────
  // LINKS / BADGES
  // ─────────────────────────────

  linkAmber:
    "inline-flex items-center gap-1 text-sm font-medium " +
    "text-[#A8833E] hover:text-[#87682F] transition-colors",

  badge:
    "inline-flex items-center gap-2 rounded-full px-3 py-1 " +
    "text-xs font-semibold " +
    "bg-[#C7A45D]/15 text-[#8B6C32] " +
    "ring-1 ring-[#C7A45D]/25",

  badgeBlue:
    "inline-flex items-center justify-center rounded-full px-3 py-1 " +
    "text-xs font-semibold " +
    "bg-[#E7EEE8] text-[#184C3A] " +
    "ring-1 ring-[#184C3A]/15",
};