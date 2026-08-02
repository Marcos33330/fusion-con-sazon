import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
}

// Generaliza el "animate-float" que hoy vive en tailwind.config.js: mismo
// movimiento idle, pero como componente para usarlo en cualquier insignia
// o ícono sin depender de una clase de utilidad fija.
export default function FloatingElement({
  children,
  className,
  distance = 14,
  duration = 7,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
