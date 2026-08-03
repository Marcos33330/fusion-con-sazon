import { motion } from "framer-motion";

interface MaskedLinesProps {
  children: string;
  className?: string;
  lineClassName?: string;
  stagger?: number;
}

// Revelado de títulos por líneas enmascaradas, como vineyard.co.za: cada
// línea vive dentro de un contenedor con overflow hidden y entra desde
// abajo. Las líneas se separan por "\n" explícito — medir el wrapping real
// exigiría medir el DOM y volver a renderizar, complejidad que no vale para
// esta prueba.
export default function MaskedLines({
  children,
  className,
  lineClassName,
  stagger = 0.08,
}: MaskedLinesProps) {
  const lines = children.split("\n");

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
