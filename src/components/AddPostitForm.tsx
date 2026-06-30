"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COULEURS_POSTIT } from "@/lib/postits";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function AddPostitForm({ user }: { user: string }) {
  const router = useRouter();
  const [nom, setNom] = useState(user);
  const [texte, setTexte] = useState("");
  const [couleur, setCouleur] = useState("jaune");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!nom.trim() || !texte.trim()) {
      setMessage({ type: "error", text: "Indique un nom et écris un petit mot." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("postits").insert({ auteur: nom.trim(), compte: user, texte: texte.trim(), couleur });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: "Erreur : " + error.message });
      return;
    }
    setMessage({ type: "success", text: "Post-it ajouté ✓" });
    setTexte("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-olive-dark">Ajouter un post-it</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Nom (qui écrit)</span>
          <input
            type="text"
            className={field}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="ex : un prénom"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">Couleur</span>
          <select className={field} value={couleur} onChange={(e) => setCouleur(e.target.value)}>
            {Object.entries(COULEURS_POSTIT).map(([cle, c]) => (
              <option key={cle} value={cle}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-muted">Message</span>
        <textarea
          className={`${field} min-h-[80px] resize-y`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Une idée, une info, un merci…"
        />
      </label>

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
        {loading ? "Ajout…" : "Épingler le post-it"}
      </button>
    </form>
  );
}
