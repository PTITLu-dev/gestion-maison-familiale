export type Naissance = {
  id?: string;
  nom: string;
  jour: number;
  mois: number;
  annee: number | null;
  branche?: number | null;
  famille?: string | null;
};

export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const STYLE_BRANCHE: Record<number, string> = {
  1: "bg-amber-100 text-amber-800",
  2: "bg-rose-100 text-rose-800",
  3: "bg-violet-100 text-violet-800",
  4: "bg-sky-100 text-sky-800",
  5: "bg-emerald-100 text-emerald-800",
  6: "bg-orange-100 text-orange-800",
};

export function familleStyle(branche?: number | null) {
  return (branche && STYLE_BRANCHE[branche]) || "bg-sand text-muted";
}

export type AnnivCalcule = Naissance & { dans: number; age: number | null; date: Date };

export function prochainsAnniversaires(
  list: Naissance[],
  n = 6,
  from: Date = new Date()
): AnnivCalcule[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const res = list.map((p) => {
    let year = today.getFullYear();
    let d = new Date(year, p.mois - 1, p.jour);
    if (d.getTime() < today.getTime()) {
      year += 1;
      d = new Date(year, p.mois - 1, p.jour);
    }
    const dans = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    const age = p.annee ? year - p.annee : null;
    return { ...p, dans, age, date: d };
  });
  res.sort((a, b) => a.dans - b.dans);
  return res.slice(0, n);
}

export function quand(dans: number): string {
  if (dans === 0) return "aujourd'hui";
  if (dans === 1) return "demain";
  return `dans ${dans} jours`;
}
