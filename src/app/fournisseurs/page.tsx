import { supabase, supabaseConfigured } from "@/lib/supabase";
import AddFournisseurForm from "@/components/AddFournisseurForm";
import FournisseursTable from "@/components/FournisseursTable";

export const dynamic = "force-dynamic";

type Fournisseur = {
  id: string;
  objet: string;
  intervenant: string | null;
  adresse: string | null;
  email: string | null;
  telephone: string | null;
  date_intervention: string | null;
};

export default async function FournisseursPage() {
  let rows: Fournisseur[] = [];
  let loadError: string | null = null;

  if (supabaseConfigured) {
    const { data, error } = await supabase
      .from("fournisseurs")
      .select("id, objet, intervenant, adresse, email, telephone, date_intervention")
      .order("objet", { ascending: true });
    if (error) loadError = error.message;
    else rows = (data ?? []) as Fournisseur[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">Fournisseurs</h1>
        <p className="text-muted">
          L&apos;annuaire des entreprises et intervenants de la maison. Chacun peut consulter et ajouter.
        </p>
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

      <AddFournisseurForm />
      <FournisseursTable rows={rows} />
    </div>
  );
}
