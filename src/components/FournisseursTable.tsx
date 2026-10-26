"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { modifierFournisseur } from "@/app/actions";

type Fournisseur = {
  id: string;
  objet: string;
  intervenant: string | null;
  adresse: string | null;
  email: string | null;
  telephone: string | null;
  date_intervention: string | null;
};

type Draft = {
  id: string;
  objet: string;
  intervenant: string;
  adresse: string;
  email: string;
  telephone: string;
  date_intervention: string;
};

const inp = "w-full rounded border border-sand bg-cream px-2 py-1 text-sm focus:border-olive focus:outline-none";

function toDraft(f: Fournisseur): Draft {
  return {
    id: f.id,
    objet: f.objet,
    intervenant: f.intervenant ?? "",
    adresse: f.adresse ?? "",
    email: f.email ?? "",
    telephone: f.telephone ?? "",
    date_intervention: f.date_intervention ?? "",
  };
}

export default function FournisseursTable({ rows }: { rows: Fournisseur[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  function set(k: keyof Draft, v: string) {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
  }

  async function save() {
    if (!draft) return;
    if (!draft.objet.trim()) return;
    setBusy(true);
    await modifierFournisseur(draft.id, {
      objet: draft.objet,
      intervenant: draft.intervenant,
      adresse: draft.adresse,
      email: draft.email,
      telephone: draft.telephone,
      date_intervention: draft.date_intervention,
    });
    setBusy(false);
    setDraft(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-sand bg-white p-4 text-muted">
        Aucun fournisseur pour le moment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-sand text-left text-muted">
            <th className="p-3">Objet</th>
            <th className="p-3">Intervenant</th>
            <th className="p-3">Coordonnées</th>
            <th className="p-3">Adresse</th>
            <th className="p-3">Date</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const editing = draft?.id === f.id;
            if (editing && draft) {
              return (
                <tr key={f.id} className="border-b border-sand/60 align-top last:border-0">
                  <td className="p-2"><input className={inp} value={draft.objet} onChange={(e) => set("objet", e.target.value)} /></td>
                  <td className="p-2"><input className={inp} value={draft.intervenant} onChange={(e) => set("intervenant", e.target.value)} /></td>
                  <td className="p-2">
                    <input className={`${inp} mb-1`} value={draft.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="Téléphone" />
                    <input className={inp} value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="E-mail" />
                  </td>
                  <td className="p-2"><input className={inp} value={draft.adresse} onChange={(e) => set("adresse", e.target.value)} /></td>
                  <td className="p-2"><input type="date" className={inp} value={draft.date_intervention} onChange={(e) => set("date_intervention", e.target.value)} /></td>
                  <td className="whitespace-nowrap p-2 text-right">
                    <button onClick={save} disabled={busy} className="mr-1 rounded-lg bg-olive px-2 py-1 text-xs font-medium text-white hover:bg-olive-dark disabled:opacity-50">
                      {busy ? "…" : "Enregistrer"}
                    </button>
                    <button onClick={() => setDraft(null)} className="rounded-lg border border-sand px-2 py-1 text-xs text-muted hover:bg-sand/60">
                      Annuler
                    </button>
                  </td>
                </tr>
              );
            }
            return (
              <tr key={f.id} className="border-b border-sand/60 align-top last:border-0">
                <td className="p-3 font-medium text-olive-dark">{f.objet}</td>
                <td className="p-3">{f.intervenant ?? "—"}</td>
                <td className="p-3">
                  {f.telephone && <a href={`tel:${f.telephone}`} className="block text-olive hover:underline">{f.telephone}</a>}
                  {f.email && <a href={`mailto:${f.email}`} className="block text-olive hover:underline">{f.email}</a>}
                  {!f.telephone && !f.email && "—"}
                </td>
                <td className="p-3 text-muted">{f.adresse ?? "—"}</td>
                <td className="p-3 text-muted">
                  {f.date_intervention ? new Date(f.date_intervention + "T00:00:00").toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setDraft(toDraft(f))} className="rounded-lg border border-sand px-2 py-1 text-xs text-muted hover:bg-sand/60 hover:text-ink">
                    Modifier
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
