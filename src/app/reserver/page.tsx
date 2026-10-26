import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase";
import { exigerActionnaire } from "@/lib/session";
import BookingSection from "@/components/BookingSection";

export default async function ReserverPage() {
  const user = await exigerActionnaire();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-olive-dark sm:text-3xl">Nouvelle réservation</h1>
        <p className="text-muted">
          Choisis tes pièces sur le plan et enregistre le séjour.{" "}
          <Link href="/planning" className="text-olive underline">
            Voir le planning
          </Link>
          .
        </p>
      </div>

      {!supabaseConfigured && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-terracotta">
          Supabase n&apos;est pas configuré : renseigne tes clés dans <code>.env.local</code> pour
          enregistrer les réservations.
        </div>
      )}

      <BookingSection user={user} />
    </div>
  );
}
