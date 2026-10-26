"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ajouterNaissance } from "@/app/actions";
import { MOIS } from "@/lib/anniversaires";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function AddBirthForm() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [jour, setJour] = useState("");
  const [mois, setMois] = useState("");
  const [annee, setAnnee] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!nom || !jour || !mois) {
      setMessage({ type: "error", text: "Indique au moins un prénom, un jour et un mois." });
      return;
    }

    setLoading(true);
    const res = await ajouterNaissance({ nom, jour, mois, annee });
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: res.error });
      return;
    }

    setMessage({ type: "success", text: "Naissance ajoutée ✓" });
    setNom("");
    setJour("");
    setMois("");
    setAnnee("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-olive-dark">Ajouter une naissance</h2>

      <div className="grid gap-4 sm:grid-cols-4">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-muted">Prénom</span>
          <input type="text" className={field} value={nom} onChange={(e) => setNom(e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">Jour</span>
          <input type="number" min="1" max="31" className={field} value={jour} onChange={(e) => setJour(e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">Mois</span>
          <select className={field} value={mois} onChange={(e) => setMois(e.target.value)}>
            <option value="">—</option>
            {MOIS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-muted">Année (optionnel)</span>
          <input type="number" className={field} value={annee} onChange={(e) => setAnnee(e.target.value)} placeholder="ex : 2024" />
        </label>
      </div>

      {message && (
        <p
          className={`rounded-lg p-3 text-sm ${
            message.type === "error"
              ? "border border-terracotta/40 bg-terracotta/10 text-terracotta"
              : "border border-olive/40 bg-olive/10 text-olive-dark"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
      >
        {loading ? "Ajout…" : "Ajouter"}
      </button>
    </form>
  );
}
