import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type RevealVariant = "fade-slide" | "fade-scale";

interface RevealOnScrollProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

const REVEAL_VARIANTS: Record<RevealVariant, Variants> = {
  "fade-slide": {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-scale": {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
};

// Reemplaza al IntersectionObserver manual de [data-reveal]: mismo timing y
// umbral, pero declarativo y sin manejar listeners a mano.
export default function RevealOnScroll({
  children,
  variant = "fade-slide",
  delay = 0,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.06, margin: "0px 0px -8% 0px" }}
      variants={REVEAL_VARIANTS[variant]}
      transition={{ duration: 0.75, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
