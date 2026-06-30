

export const COULEURS_POSTIT: Record<string, { label: string; classe: string }> = {
  jaune: { label: "Jaune", classe: "bg-yellow-100 border-yellow-300" },
  rose: { label: "Rose", classe: "bg-rose-100 border-rose-300" },
  vert: { label: "Vert", classe: "bg-emerald-100 border-emerald-300" },
  bleu: { label: "Bleu", classe: "bg-sky-100 border-sky-300" },
  orange: { label: "Orange", classe: "bg-orange-100 border-orange-300" },
};

export function classePostit(couleur: string) {
  return (COULEURS_POSTIT[couleur] ?? COULEURS_POSTIT.jaune).classe;
}

export type Postit = {
  id: string;
  auteur: string;
  texte: string;
  couleur: string;
  epingle: boolean;
  created_at: string;
};
