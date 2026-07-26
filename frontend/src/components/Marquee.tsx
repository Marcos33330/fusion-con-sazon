interface Props {
  items: string[];
}

// Cinta en loop infinito, inspirada en la referencia Banh Mi World que pidió
// el cliente. Duplicamos los items una vez y animamos con translateX(-50%)
// para que el loop sea perfectamente continuo (sin salto al reiniciar).
export default function Marquee({ items }: Props) {
  return (
    <div className="bg-brand-dark overflow-hidden py-3 border-y-4 border-brand-mustard">
      <div className="flex w-max whitespace-nowrap animate-marquee">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center gap-10 pr-10 shrink-0">
            {items.map((item, i) => (
              <span
                key={`${rep}-${i}`}
                className="flex items-center gap-3 text-base md:text-lg font-extrabold uppercase tracking-wide text-white"
              >
                {item}
                <span className="text-brand-mustard">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
