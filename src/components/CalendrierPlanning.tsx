"use client";

import { useState } from "react";

export type Evt = {
  id: string;
  titre: string;
  sousTitre: string;
  arrivee: string;
  depart: string;
  type?: string;
};

function chipClass(type?: string) {
  if (type === "rdv") return "bg-sky-100 text-sky-800";
  if (type === "evenement") return "bg-amber-100 text-amber-800";
  return "bg-olive/15 text-olive-dark";
}

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function ymd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

const btn = "rounded-lg border border-sand px-2.5 py-1 text-sm text-ink hover:bg-sand/60";

export default function CalendrierPlanning({ events }: { events: Evt[] }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const first = new Date(cur.y, cur.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(cur.y, cur.m, 1 - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  const todayStr = ymd(today);

  function eventsFor(d: Date) {
    const s = ymd(d);
    return events.filter((e) => s >= e.arrivee && s < e.depart);
  }

  const prev = () => setCur((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  const next = () => setCur((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));
  const goToday = () => setCur({ y: today.getFullYear(), m: today.getMonth() });

  return (
    <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold capitalize text-olive-dark">
          {MOIS[cur.m]} {cur.y}
        </h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={goToday} className={btn}>
            Aujourd&apos;hui
          </button>
          <button type="button" onClick={prev} aria-label="Mois précédent" className={btn}>
            ‹
          </button>
          <button type="button" onClick={next} aria-label="Mois suivant" className={btn}>
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-olive/40" /> Séjour</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-sky-300" /> Rendez-vous</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-amber-300" /> Événement</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted">
            {JOURS.map((j) => (
              <div key={j} className="py-1">
                {j}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-sand">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === cur.m;
              const evts = eventsFor(d);
              const isToday = ymd(d) === todayStr;
              return (
                <div key={i} className={`min-h-[88px] bg-white p-1 ${inMonth ? "" : "opacity-40"}`}>
                  <div
                    className={`mb-1 text-right text-xs ${
                      isToday ? "font-bold text-terracotta" : "text-muted"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {evts.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        title={`${e.titre} — ${e.sousTitre}`}
                        className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight ${chipClass(e.type)}`}
                      >
                        {e.titre} · {e.sousTitre}
                      </div>
                    ))}
                    {evts.length > 3 && (
                      <div className="text-[10px] text-muted">+{evts.length - 3} autre(s)</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
