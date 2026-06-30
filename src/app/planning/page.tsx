import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { getActionnaire } from "@/lib/session";
import { jourSuivant, type Evenement } from "@/lib/evenements";
import CalendrierPlanning, { type Evt } from "@/components/CalendrierPlanning";
import AddEventForm from "@/components/AddEventForm";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  famille: string;
  occupant: string | null;
  arrivee: string;
  depart: string;
  chambres: { nom: string } | null;
};

export default async function PlanningPage() {
  const user = await getActionnaire();
  let events: Evt[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    const [resaRes, evRes] = await Promise.all([
      supabase
        .from("reservations")
        .select("id, famille, occupant, arrivee, depart, chambres(nom)")
        .order("arrivee", { ascending: true }),
      supabase.from("evenements").select("id, titre, type, date, heure, lieu, description, auteur"),
    ]);
    if (resaRes.error) loadError = resaRes.error.message;

    const sejours: Evt[] = ((resaRes.data ?? []) as unknown as Row[]).map((r) => ({
      id: r.id,
      titre: r.chambres?.nom ?? "Chambre",
      sousTitre: r.occupant || r.famille,
      arrivee: r.arrivee,
      depart: r.depart,
      type: "sejour",
    }));

    const evenements: Evt[] = ((evRes.data ?? []) as Evenement[]).map((e) => ({
      id: "ev-" + e.id,
      titre: (e.heure ? e.heure + " " : "") + e.titre,
      sousTitre: e.lieu ?? "",
      arrivee: e.date,
      depart: jourSuivant(e.date),
      type: e.type,
    }));

    events = [...sejours, ...evenements];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">Le planning de la maison</h1>
          <p className="text-muted">Séjours, rendez-vous et événements de la famille.</p>
        </div>
        <Link
          href="/reserver"
          className="rounded-full bg-olive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-olive-dark"
        >
          + Nouvelle réservation
        </Link>
      </div>

      {!supabaseConfigured && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Supabase n&apos;est pas configuré : le calendrier s&apos;affiche, mais sans données.
        </div>
      )}
      {loadError && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Impossible de charger les réservations : {loadError}
        </div>
      )}

      <CalendrierPlanning events={events} />

      <details className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-lg font-semibold text-olive-dark">
          ➕ Ajouter un rendez-vous ou un événement
        </summary>
        <div className="mt-4">
          <AddEventForm user={user ?? ""} />
        </div>
      </details>
    </div>
  );
}
