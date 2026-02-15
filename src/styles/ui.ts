
// src/styles/ui.ts
export const ui = {
  // ✅ Background global (toutes les pages)
  pageBg:
    "min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900",

    // ✅ Dashboard background (bleu nuit fixe)
dashboardBg: "min-h-screen bg-[#0B1020] text-slate-100",
 
  // ✅ Containers
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  containerWide: "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8",

  // ✅ Page padding (contenu)
  page: "max-w-7xl mx-auto p-4 sm:p-6",

  // ✅ Titres & textes
  title: "text-2xl sm:text-3xl font-bold text-slate-100",
  subtitle: "text-sm sm:text-base text-slate-300/80",
  muted: "text-sm text-slate-300/70",

  // ✅ Surfaces (glass / cards)
  glassPanel:
    "bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 ring-1 ring-white/5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
  card:
    "bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 ring-1 ring-white/5 rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)] hover:border-slate-700/80",

  // ✅ Inputs (standard)
  input:
    "w-full h-10 px-4 rounded-xl bg-slate-900/60 backdrop-blur-sm " +
    "border border-slate-800/80 ring-1 ring-white/5 " +
    "text-slate-100 placeholder:text-slate-400 " +
    "transition-all duration-200 " +
    "hover:border-slate-700/80 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",

  textarea:
    "w-full min-h-[120px] px-4 py-3 rounded-xl bg-slate-900/60 backdrop-blur-sm " +
    "border border-slate-800/80 ring-1 ring-white/5 " +
    "text-slate-100 placeholder:text-slate-400 " +
    "transition-all duration-200 " +
    "hover:border-slate-700/80 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",

  // ✅ Inputs “soft” (bleu + clair que le fond) → pour éviter le blanc
  inputSoft:
    "w-full h-10 px-4 rounded-xl bg-slate-800/70 backdrop-blur-sm " +
    "border border-slate-700/80 ring-1 ring-white/5 " +
    "text-slate-100 placeholder:text-slate-400 " +
    "transition-all duration-200 " +
    "hover:border-slate-600/80 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",

  textareaSoft:
    "w-full min-h-[120px] px-4 py-3 rounded-xl bg-slate-800/70 backdrop-blur-sm " +
    "border border-slate-700/80 ring-1 ring-white/5 " +
    "text-slate-100 placeholder:text-slate-400 " +
    "transition-all duration-200 " +
    "hover:border-slate-600/80 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",

  selectSoft:
    "w-full h-10 px-4 rounded-xl bg-slate-800/70 backdrop-blur-sm " +
    "border border-slate-700/80 ring-1 ring-white/5 " +
    "text-slate-100 " +
    "transition-all duration-200 " +
    "hover:border-slate-600/80 " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",

  // ✅ Boutons
  btnPrimary:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium " +
    "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 " +
    "shadow-md shadow-amber-500/25 ring-1 ring-amber-400/30 " +
    "transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:scale-[0.98]",

  btnGhost:
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium " +
    "text-slate-200/90 hover:bg-slate-800/70 hover:text-slate-100 " +
    "ring-1 ring-transparent hover:ring-slate-700/60 " +
    "transition-all duration-200 active:scale-[0.98]",
  
  // ✅ Liens
  linkAmber:
    "inline-flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors",

  badge:
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold " +
    "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25",

  badgeBlue:
    "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold " +
    "bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/25",

  cardSoft:
    "bg-slate-900/40 backdrop-blur-sm border border-slate-800/70 ring-1 ring-white/5 " +
    "rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]",

  btnDark:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium " +
    "bg-slate-950/60 text-slate-100 ring-1 ring-slate-700/60 " +
    "hover:bg-slate-900/70 hover:ring-slate-600/60 transition-all duration-200 active:scale-[0.98]",
};
