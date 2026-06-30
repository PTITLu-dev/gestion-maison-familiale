"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionnaires, setActionnaires] = useState<string[]>([]);

  useEffect(() => {
    supabase.rpc("liste_actionnaires").then(({ data }) => {
      if (data) setActionnaires(data as string[]);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant, motdepasse }),
    });
    const j = await res.json();
    setLoading(false);
    if (!j.ok) {
      setError(j.error ?? "Erreur de connexion.");
      return;
    }
    if (j.doitChanger) {
      router.push("/mon-compte?force=1");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-1 text-2xl font-bold text-olive-dark">La Maison</h1>
      <p className="mb-6 text-muted">Connexion à l&apos;espace privé de la famille.</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Actionnaire</span>
          <select className={field} value={identifiant} onChange={(e) => setIdentifiant(e.target.value)}>
            <option value="">— choisir —</option>
            {actionnaires.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">Mot de passe</span>
          <input type="password" className={field} value={motdepasse} onChange={(e) => setMotdepasse(e.target.value)} />
        </label>

        {error && (
          <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 p-3 text-sm text-terracotta">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-olive px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

    </div>
  );
}
