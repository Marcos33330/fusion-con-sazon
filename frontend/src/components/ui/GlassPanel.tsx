import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

// Glassmorphism: blur + borde translúcido + sombra cálida existente
// (shadow-warm ya definida en tailwind.config.js). Sin animación propia —
// se combina con RevealOnScroll donde haga falta entrada animada.
export default function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-[1.5rem] border border-white/20 bg-white/10 shadow-warm backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
