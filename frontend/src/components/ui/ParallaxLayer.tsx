import { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useParallaxContext } from "./ParallaxGroup";

interface ParallaxLayerProps {
  children?: ReactNode;
  className?: string;
  depth?: number;
  range?: number;
}

// Una capa dentro de un ParallaxGroup. depth=0 no se mueve, depth=1 se mueve
// range px hacia donde está el mouse. Si se usa fuera de un ParallaxGroup (o
// en touch/reduced-motion), queda estática — nunca lanza error.
export default function ParallaxLayer({ children, className, depth = 0.5, range = 24 }: ParallaxLayerProps) {
  const ctx = useParallaxContext();
  const fallback = useMotionValue(0);
  const maxOffset = range * depth;

  const translateX = useSpring(useTransform(ctx?.x ?? fallback, [-0.5, 0.5], [-maxOffset, maxOffset]), {
    stiffness: 150,
    damping: 20,
  });
  const translateY = useSpring(useTransform(ctx?.y ?? fallback, [-0.5, 0.5], [-maxOffset, maxOffset]), {
    stiffness: 150,
    damping: 20,
  });

  const enabled = ctx?.enabled ?? false;

  return (
    <motion.div className={className} style={enabled ? { x: translateX, y: translateY } : undefined}>
      {children}
    </motion.div>
  );
}
