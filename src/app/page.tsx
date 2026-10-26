import Link from "next/link";
import Card from "@/components/Card";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { MOIS, prochainsAnniversaires, quand, familleStyle, type Naissance } from "@/lib/anniversaires";
import { classePostit, type Postit } from "@/lib/postits";
import { TYPE_LABEL, type Evenement } from "@/lib/evenements";
import { exigerActionnaire } from "@/lib/session";

const reservations = [
  { famille: "Famille Martin", detail: "Maison entière", dates: "28 juin → 5 juil." },
  { famille: "Famille Petit", detail: "Chambre 3 + Dortoir", dates: "12 → 19 juil." },
  { famille: "Famille Durand", detail: "Chambre 5", dates: "2 → 9 août" },
];
const entretiens = [
  { titre: "Entretien chaudière", echeance: "15 sept.", retard: false },
  { titre: "Vidange fosse septique", echeance: "En retard", retard: true },
  { titre: "Hivernage piscine", echeance: "30 oct.", retard: false },
];

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-olive-dark">{value}</p>
      <p className="text-sm text-olive">{hint}</p>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await exigerActionnaire();
  let naissances: Naissance[] = [];
  let postits: Postit[] = [];
  let evenements: Evenement[] = [];
  if (supabaseConfigured) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const [nRes, pRes, eRes] = await Promise.all([
      supabase.from("naissances").select("id, nom, jour, mois, annee, branche, famille"),
      supabase
        .from("postits")
        .select("id, auteur, texte, couleur, epingle, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("evenements")
        .select("id, titre, type, date, heure, lieu, description, auteur")
        .gte("date", todayStr)
        .order("date", { ascending: true })
        .limit(4),
    ]);
    naissances = (nRes.data ?? []) as Naissance[];
    postits = (pRes.data ?? []) as Postit[];
    evenements = (eRes.data ?? []) as Evenement[];
  }
  const prochains = prochainsAnniversaires(naissances, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">La Maison</h1>
        <p className="text-muted">Voici ce qui se passe à la maison.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Solde de la SCI" value="4 280 €" hint="+ 320 € ce mois-ci" />
        <Stat label="Prochaine arrivée" value="28 juin" hint="Famille Martin" />
        <Stat label="Travaux en cours" value="1" hint="Réfection de la terrasse" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-olive-dark">Le mur de post-its</h2>
          <Link href="/post-its" className="text-sm text-olive hover:underline">
            Voir tout / écrire un mot →
          </Link>
        </div>
        {postits.length === 0 ? (
          <Link
            href="/post-its"
            className="block rounded-2xl border border-dashed border-sand bg-white p-6 text-center text-muted hover:border-olive hover:text-ink"
          >
            Aucun post-it pour l&apos;instant — sois le premier à en épingler un ✏️
          </Link>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {postits.map((p, i) => (
              <div
                key={p.id}
                className={`rounded-xl border p-4 shadow-sm ${classePostit(p.couleur)} ${
                  i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm text-ink">{p.texte}</p>
                <p className="mt-3 text-xs text-ink/60">— {p.auteur}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {evenements.length > 0 && (
          <Card title="Rendez-vous & événements" icon="📅">
            <ul className="space-y-2">
              {evenements.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{e.titre}</p>
                    <p className="text-sm text-muted">
                      {TYPE_LABEL[e.type] ?? "Événement"}
                      {e.lieu ? ` · ${e.lieu}` : ""}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm text-olive">
                    {new Date(e.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    {e.heure ? ` · ${e.heure}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Prochains anniversaires" icon="🎂">
          {prochains.length === 0 ? (
            <p className="text-sm text-muted">
              {supabaseConfigured ? "Aucun anniversaire enregistré." : "Configure Supabase pour les anniversaires."}
            </p>
          ) : (
            <ul className="space-y-2">
              {prochains.map((p) => (
                <li key={(p.id ?? p.nom) + p.jour + p.mois} className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{p.nom}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${familleStyle(p.branche)}`}>
                      {p.famille ?? "à préciser"}
                    </span>
                    <span className="text-sm text-muted">
                      {p.jour} {MOIS[p.mois - 1]}
                      {p.age !== null ? ` · ${p.age} ans` : ""}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-sm text-olive">{quand(p.dans)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Prochaines réservations" icon="🛏️">
          <ul className="space-y-3">
            {reservations.map((r) => (
              <li key={r.famille + r.dates} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.famille}</p>
                  <p className="text-sm text-muted">{r.detail}</p>
                </div>
                <span className="whitespace-nowrap text-sm text-olive">{r.dates}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Entretien à venir" icon="🔧">
          <ul className="space-y-2">
            {entretiens.map((e) => (
              <li key={e.titre} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${e.retard ? "bg-terracotta" : "bg-olive"}`} />
                  {e.titre}
                </span>
                <span className={`text-sm ${e.retard ? "font-medium text-terracotta" : "text-muted"}`}>
                  {e.echeance}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
