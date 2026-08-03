import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ParallaxImageProps {
  src: string;
  alt?: string;
  className?: string;
  overflowPct?: number;
}

// Parallax como vineyard.co.za: el marco recorta (overflow hidden) y la
// imagen, más alta que el marco, se desplaza dentro de él según el scroll.
export default function ParallaxImage({
  src,
  alt = "",
  className,
  overflowPct = 30,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // La imagen sobra overflowPct% en alto; la desplazamos entre los dos
  // extremos de ese sobrante para que nunca se vea un borde vacío.
  const half = overflowPct / 2;
  const y = useTransform(scrollYProgress, [0, 1], [`-${half}%`, `${half}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-x-0 w-full object-cover"
        style={
          prefersReducedMotion
            ? { top: 0, height: "100%" }
            : { y, top: `-${half}%`, height: `${100 + overflowPct}%` }
        }
      />
    </div>
  );
}
