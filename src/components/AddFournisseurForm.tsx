"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function AddFournisseurForm() {
  const router = useRouter();
  const [objet, setObjet] = useState("");
  const [intervenant, setIntervenant] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!objet.trim()) {
      setMessage({ type: "error", text: "Indique au moins l'objet (ex : Toiture)." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("fournisseurs").insert({
      objet: objet.trim(),
      intervenant: intervenant || null,
      adresse: adresse || null,
      email: email || null,
      telephone: telephone || null,
      date_intervention: date || null,
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: "Erreur : " + error.message });
      return;
    }
    setMessage({ type: "success", text: "Fournisseur ajouté ✓" });
    setObjet("");
    setIntervenant("");
    setAdresse("");
    setEmail("");
    setTelephone("");
    setDate("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-olive-dark">Ajouter un fournisseur</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Objet</span>
          <input type="text" className={field} value={objet} onChange={(e) => setObjet(e.target.value)} placeholder="ex : Toiture, Élagage…" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Intervenant (nom)</span>
          <input type="text" className={field} value={intervenant} onChange={(e) => setIntervenant(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-muted">Adresse</span>
          <input type="text" className={field} value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">E-mail</span>
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Téléphone</span>
          <input type="tel" className={field} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Date d&apos;intervention (optionnel)</span>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
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
