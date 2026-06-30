"use client";

import { useState } from "react";
import type { Arbre, Noeud } from "@/lib/arbre";
import { familleStyle } from "@/lib/anniversaires";

function ligne(nom: string, annee: number | null) {
  return annee ? `${nom} (${annee})` : nom;
}

function NoeudVue({ n }: { n: Noeud }) {
  const [open, setOpen] = useState(false);
  const hasKids = n.enfants.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1.5">
        {hasKids ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Replier" : "Déplier"}
            className="w-5 shrink-0 text-muted hover:text-ink"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-sm ${familleStyle(n.branche)}`}>
          {ligne(n.nom, n.annee)}
          {n.conjoint ? ` ⚭ ${ligne(n.conjoint.nom, n.conjoint.annee)}` : ""}
        </span>
      </div>

      {hasKids && open && (
        <ul className="ml-3 mt-2 space-y-2 border-l border-sand pl-3">
          {n.enfants.map((e, i) => (
            <NoeudVue key={i} n={e} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ArbreGenealogique({ arbre }: { arbre: Arbre }) {
  const { racine, branches } = arbre;
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <p className="mb-3 text-base font-semibold text-olive-dark">
        {ligne(racine.nom, racine.annee)} ⚭ {ligne(racine.conjoint.nom, racine.conjoint.annee)}
      </p>
      <ul className="space-y-2 border-l-2 border-olive/30 pl-3">
        {branches.map((b, i) => (
          <NoeudVue key={i} n={b} />
        ))}
      </ul>
    </div>
  );
}
