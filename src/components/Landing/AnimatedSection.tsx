import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

type AnimatedSectionProps = {
  children: React.ReactNode;
  direction?: "left" | "right" | "none";
  className?: string;
};

export function AnimatedSection({ children, direction = "none", className = "" }: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);

  // On suit la progression de la section par rapport au viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Easing Apple-like (Spring doux)
  const springConfig = { stiffness: 60, damping: 20, restDelta: 0.001 };

  // Mapping des animations (se déclenchent entre 5% et 35% de l'entrée en scène)
  const opacityRaw = useTransform(scrollYProgress, [0, 0.2, 0.35], [0, 0, 1]);
  const yRaw = useTransform(scrollYProgress, [0, 0.2, 0.35], [80, 80, 0]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.2, 0.35], [0.96, 0.96, 1]);
  
  // Décalage horizontal selon la direction choisie
  const xOffset = direction === "left" ? -60 : direction === "right" ? 60 : 0;
  const xRaw = useTransform(scrollYProgress, [0, 0.2, 0.35], [xOffset, xOffset, 0]);

  // Application du ressort pour la fluidité
  const opacity = useSpring(opacityRaw, springConfig);
  const y = useSpring(yRaw, springConfig);
  const scale = useSpring(scaleRaw, springConfig);
  const x = useSpring(xRaw, springConfig);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y, scale, x }}
      className={className}
    >
      {children}
    </motion.section>
  );
}