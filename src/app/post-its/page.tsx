import { supabase, supabaseConfigured } from "@/lib/supabase";
import { classePostit, type Postit } from "@/lib/postits";
import AddPostitForm from "@/components/AddPostitForm";
import { exigerActionnaire } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PostitsPage() {
  const user = await exigerActionnaire();
  let postits: Postit[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    const { data, error } = await supabase
      .from("postits")
      .select("id, auteur, texte, couleur, epingle, created_at")
      .order("epingle", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) loadError = error.message;
    else postits = (data ?? []) as Postit[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">Mur de post-its</h1>
        <p className="text-muted">Idées, infos et petits mots entre la famille.</p>
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

      <AddPostitForm user={user} />

      {postits.length === 0 ? (
        <p className="rounded-xl border border-sand bg-white p-4 text-muted">
          Aucun post-it pour le moment. Sois le premier à en épingler un !
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postits.map((p, i) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 shadow-sm ${classePostit(p.couleur)} ${
                i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
              }`}
            >
              {p.epingle && <div className="mb-1 text-lg leading-none">📌</div>}
              <p className="whitespace-pre-wrap text-sm text-ink">{p.texte}</p>
              <p className="mt-3 text-xs text-ink/60">
                — {p.auteur} · {formatDate(p.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
