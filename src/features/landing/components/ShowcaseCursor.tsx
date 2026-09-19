import { motion } from "framer-motion";

export type ShowcaseCursorState = {
  x: number;
  y: number;
  click: boolean;
  visible: boolean;
};

type ShowcaseCursorProps = ShowcaseCursorState & {
  stiffness?: number;
};

export function ShowcaseCursor({
  x,
  y,
  click,
  visible,
  stiffness = 220,
}: ShowcaseCursorProps) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{
        x,
        y,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness,
        damping: 24,
        mass: 0.7,
      }}
      className="absolute z-[80] pointer-events-none"
    >
      <motion.div
        animate={{ scale: click ? 0.92 : 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute left-[2px] top-[2px]">
          <svg
            width="18"
            height="24"
            viewBox="0 0 18 24"
            fill="none"
            className="opacity-25"
          >
            <path
              d="M2.2 1.5L15.7 13.7L9.4 14.2L12.5 21.4L9.7 22.5L6.7 15.4L2.4 19V1.5Z"
              fill="black"
            />
          </svg>
        </div>

        <svg
          width="18"
          height="24"
          viewBox="0 0 18 24"
          fill="none"
          className="relative"
        >
          <path
            d="M1.5 1L15.5 13.5L9.1 14L12.2 21.3L9.3 22.4L6.3 15.2L2 18.8V1Z"
            fill="white"
            stroke="#111827"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>

        <motion.div
          animate={
            click
              ? { scale: 1.8, opacity: 0 }
              : { scale: 1, opacity: 0 }
          }
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute left-[-2px] top-[-2px] h-6 w-6 rounded-full border border-white/60"
        />
      </motion.div>
    </motion.div>
  );
}