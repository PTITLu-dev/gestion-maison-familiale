"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ajouterEvenement } from "@/app/actions";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function AddEventForm() {
  const router = useRouter();
  const [type, setType] = useState("evenement");
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [lieu, setLieu] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!titre.trim() || !date) {
      setMessage({ type: "error", text: "Indique un titre et une date." });
      return;
    }
    setLoading(true);
    const res = await ajouterEvenement({ titre, type, date, heure, lieu });
    setLoading(false);
    if (!res.ok) {
      setMessage({ type: "error", text: res.error });
      return;
    }
    setMessage({ type: "success", text: "Ajouté au calendrier ✓" });
    setTitre("");
    setDate("");
    setHeure("");
    setLieu("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Type</span>
          <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="evenement">Événement familial</option>
            <option value="rdv">Rendez-vous</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Titre</span>
          <input type="text" className={field} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="ex : Apéro de famille" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Date</span>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Heure (optionnel)</span>
          <input type="time" className={field} value={heure} onChange={(e) => setHeure(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-muted">Lieu (optionnel)</span>
          <input type="text" className={field} value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="ex : La Maison" />
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
        {loading ? "Ajout…" : "Ajouter au calendrier"}
      </button>
    </form>
  );
}
