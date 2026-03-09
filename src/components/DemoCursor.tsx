import { motion } from "framer-motion";

type Props = {
  x: number;
  y: number;
  click?: boolean;
};

export function DemoCursor({ x, y, click }: Props) {
  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="absolute z-[100] pointer-events-none"
    >
      <motion.div
        animate={click ? { scale: 0.9 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        {/* curseur */}
        <div className="w-5 h-5 bg-white rounded-full shadow-lg" />

        {/* halo */}
        <motion.div
          animate={click ? { scale: 1.6, opacity: 0 } : { scale: 1, opacity: 0.4 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}