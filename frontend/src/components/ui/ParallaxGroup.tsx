import { createContext, MouseEvent, ReactNode, useContext, useState } from "react";
import { motion, MotionValue, useMotionValue, useReducedMotion } from "framer-motion";

interface ParallaxContextValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
  enabled: boolean;
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

export function useParallaxContext() {
  return useContext(ParallaxContext);
}

interface ParallaxGroupProps {
  children: ReactNode;
  className?: string;
}

// Trackea el mouse dentro de su propio recuadro (normalizado a -0.5..0.5) y lo
// comparte por contexto con los ParallaxLayer hijos, cada uno moviéndose a su
// propia profundidad. Reemplaza a TiltCard en el hero: en vez de un bloque
// rígido que rota, varias capas independientes se desplazan a velocidades
// distintas, dando sensación de profundidad real.
export default function ParallaxGroup({ children, className }: ParallaxGroupProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const [canHover] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  const enabled = canHover && !prefersReducedMotion;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <ParallaxContext.Provider value={{ x, y, enabled }}>{children}</ParallaxContext.Provider>
    </motion.div>
  );
}
