"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function MonComptePage() {
  const router = useRouter();

  const [force] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("force") === "1"
  );

  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (nouveau.length < 6) {
      setMessage({ type: "error", text: "Le nouveau mot de passe doit faire au moins 6 caractères." });
      return;
    }
    if (nouveau !== confirm) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ancien, nouveau }),
    });
    const j = await res.json();
    setLoading(false);
    if (!j.ok) {
      setMessage({ type: "error", text: j.error ?? "Erreur." });
      return;
    }
    setMessage({ type: "success", text: "Mot de passe modifié ✓ Redirection…" });
    setAncien("");
    setNouveau("");
    setConfirm("");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1000);
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold text-olive-dark">Mon compte</h1>
      <p className="mb-6 text-muted">
        {force
          ? "Première connexion : choisis ton propre mot de passe."
          : "Changer ton mot de passe."}
      </p>

      {force && (
        <div className="mb-4 rounded-xl border border-olive/40 bg-olive/10 p-3 text-sm text-olive-dark">
          Pour ta sécurité, remplace le mot de passe par défaut par un mot de passe personnel.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Mot de passe actuel</span>
          <input type="password" className={field} value={ancien} onChange={(e) => setAncien(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Nouveau mot de passe</span>
          <input type="password" className={field} value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Confirmer le nouveau mot de passe</span>
          <input type="password" className={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
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
          className="w-full rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Changer mon mot de passe"}
        </button>
      </form>
    </div>
  );
}
