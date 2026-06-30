"use client";

import { CHAMBRES, ETAGES } from "@/lib/chambres";

export default function PlanParadou({
  selectedIds,
  disabledIds = [],
  onToggle,
}: {
  selectedIds: number[];
  disabledIds?: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="space-y-5">
      {ETAGES.map((etage) => (
        <div key={etage.nom}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{etage.nom}</h3>

          <div
            className="rounded-2xl border border-sand bg-cream p-3"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${etage.colonnes}, minmax(0, 1fr))`,
              gridAutoRows: "minmax(76px, auto)",
              gap: "0.5rem",
            }}
          >
            {CHAMBRES.filter((c) => c.etage === etage.nom).map((c) => {
              const selected = selectedIds.includes(c.id);
              const taken = disabledIds.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  disabled={taken}
                  onClick={() => onToggle(c.id)}
                  aria-pressed={selected}
                  style={{ gridColumn: c.col, gridRow: c.row }}
                  className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all ${
                    taken
                      ? "cursor-not-allowed border-sand bg-sand/50 text-muted opacity-70"
                      : selected
                        ? "border-olive bg-olive text-white shadow-md"
                        : "border-sand bg-white text-ink hover:border-olive hover:shadow"
                  } ${c.appoint && !taken && !selected ? "border-dashed" : ""}`}
                >
                  <span className="flex items-center justify-between text-sm font-semibold">
                    <span className={taken ? "line-through" : ""}>{c.nom}</span>
                    {selected && <span aria-hidden>✓</span>}
                    {taken && <span aria-hidden>🔒</span>}
                  </span>
                  <span className={`text-[11px] leading-tight ${selected ? "text-white/80" : "text-muted"}`}>
                    {taken ? "déjà réservé" : `${c.capacite}${c.appoint ? " · appoint" : ""}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted">Les pièces grisées 🔒 sont déjà réservées sur ces dates.</p>
    </div>
  );
}
