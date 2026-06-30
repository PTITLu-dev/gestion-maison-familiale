export type Evenement = {
  id: string;
  titre: string;
  type: string;
  date: string;
  heure: string | null;
  lieu: string | null;
  description: string | null;
  auteur: string | null;
};

export function jourSuivant(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + 1);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

export const TYPE_LABEL: Record<string, string> = { rdv: "Rendez-vous", evenement: "Événement" };

export function formatDateFr(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
