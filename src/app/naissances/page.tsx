import { supabase, supabaseConfigured } from "@/lib/supabase";
import { MOIS, prochainsAnniversaires, quand, familleStyle, type Naissance } from "@/lib/anniversaires";
import type { Arbre } from "@/lib/arbre";
import AddBirthForm from "@/components/AddBirthForm";
import ArbreGenealogique from "@/components/ArbreGenealogique";

export const dynamic = "force-dynamic";

function Pastille({ famille, branche }: { famille?: string | null; branche?: number | null }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${familleStyle(branche)}`}>
      {famille ?? "à préciser"}
    </span>
  );
}

export default async function NaissancesPage() {
  let list: Naissance[] = [];
  let arbre: Arbre | null = null;
  let loadError: string | null = null;

  if (supabaseConfigured) {
    const [nRes, aRes] = await Promise.all([
      supabase.from("naissances").select("id, nom, jour, mois, annee, branche, famille"),
      supabase.from("arbre").select("data").eq("cle", "paradou").maybeSingle(),
    ]);
    if (nRes.error) loadError = nRes.error.message;
    else list = (nRes.data ?? []) as Naissance[];
    arbre = (aRes.data?.data ?? null) as Arbre | null;
  }

  const prochains = prochainsAnniversaires(list, 6);
  const parMois = MOIS.map((nom, i) => ({
    nom,
    mois: i + 1,
    gens: list.filter((p) => p.mois === i + 1).sort((a, b) => a.jour - b.jour),
  }));
  const legende = Array.from(
    new Map(list.filter((p) => p.branche).map((p) => [p.branche as number, p.famille ?? ""])).entries()
  ).sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">Anniversaires & naissances</h1>
        <p className="text-muted">Le calendrier familial de la maison, par famille.</p>
      </div>

      {!supabaseConfigured && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Supabase n&apos;est pas configuré : renseigne tes clés dans <code>.env.local</code>.
        </div>
      )}
      {loadError && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Erreur de chargement : {loadError}
        </div>
      )}

      {legende.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {legende.map(([branche, famille]) => (
            <Pastille key={branche} famille={famille} branche={branche} />
          ))}
        </div>
      )}

      {arbre && (
        <details className="group">
          <summary className="cursor-pointer text-lg font-semibold text-olive-dark">
            Arbre de la famille
          </summary>
          <div className="mt-3">
            <ArbreGenealogique arbre={arbre} />
          </div>
        </details>
      )}

      {prochains.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-olive-dark">Prochains anniversaires</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prochains.map((p) => (
              <div key={(p.id ?? p.nom) + p.jour + p.mois} className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-olive-dark">{p.nom}</p>
                  <Pastille famille={p.famille} branche={p.branche} />
                </div>
                <p className="text-sm text-muted">
                  {p.jour} {MOIS[p.mois - 1]}
                  {p.age !== null ? ` · ${p.age} ans` : ""}
                </p>
                <p className="mt-1 text-sm text-olive">{quand(p.dans)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddBirthForm />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-olive-dark">Tout le calendrier</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parMois.map((m) => (
            <div key={m.mois} className="rounded-2xl border border-sand bg-white p-4 shadow-sm">
              <h3 className="mb-2 font-semibold capitalize text-olive-dark">{m.nom}</h3>
              {m.gens.length === 0 ? (
                <p className="text-sm text-muted">—</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {m.gens.map((p) => (
                    <li key={(p.id ?? p.nom) + p.jour} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="w-6 text-right text-muted">{p.jour}</span>
                        {p.nom}
                        {p.annee ? <span className="text-muted">({p.annee})</span> : null}
                      </span>
                      <Pastille famille={p.famille} branche={p.branche} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
