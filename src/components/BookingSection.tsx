"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { chambresPrises, reserver } from "@/app/actions";
import { CHAMBRES } from "@/lib/chambres";
import PlanParadou from "@/components/PlanParadou";

const field =
  "w-full rounded-lg border border-sand bg-cream px-3 py-2 text-sm focus:border-olive focus:outline-none";
const carte = "space-y-4 rounded-2xl border border-sand bg-white p-5 shadow-sm";

function chevaucheEte(arrivee: string, depart: string) {
  const ya = Number(arrivee.slice(0, 4));
  const yd = Number(depart.slice(0, 4));
  for (let y = ya; y <= yd; y++) {
    const debut = `${y}-06-15`;
    const fin = `${y}-09-16`;
    if (arrivee < fin && depart > debut) return true;
  }
  return false;
}

export default function BookingSection({ user }: { user: string }) {
  const router = useRouter();

  const [arrivee, setArrivee] = useState("");
  const [depart, setDepart] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [takenIds, setTakenIds] = useState<number[]>([]);
  const [occupant, setOccupant] = useState("");
  const [personnes, setPersonnes] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const datesValides = Boolean(arrivee && depart && depart > arrivee);
  const nuits = datesValides
    ? Math.round((new Date(depart).getTime() - new Date(arrivee).getTime()) / 86_400_000)
    : 0;

  useEffect(() => {
    let annule = false;
    async function charger() {
      if (!datesValides) {
        setTakenIds([]);
        return;
      }

      const ids = await chambresPrises(arrivee, depart);
      if (annule) return;
      setTakenIds(ids);

      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    }
    charger();
    return () => {
      annule = true;
    };
  }, [arrivee, depart, datesValides]);

  function toggleRoom(id: number) {
    if (takenIds.includes(id)) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toutSelectionner() {
    setSelectedIds(CHAMBRES.filter((c) => !takenIds.includes(c.id)).map((c) => c.id));
  }

  const selectedNames = CHAMBRES.filter((c) => selectedIds.includes(c.id)).map((c) => c.nom);
  const dispoCount = CHAMBRES.length - takenIds.length;
  const maisonComplete = takenIds.length === 0 && dispoCount > 0 && selectedIds.length === dispoCount;
  const ete = datesValides && chevaucheEte(arrivee, depart);
  const maisonInterdite = ete || takenIds.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!datesValides) {
      setMessage({ type: "error", text: "Choisis une date d'arrivée et une date de départ valides." });
      return;
    }
    if (selectedIds.length === 0) {
      setMessage({ type: "error", text: "Sélectionne au moins une pièce." });
      return;
    }
    if (ete && selectedIds.length === CHAMBRES.length) {
      setMessage({
        type: "error",
        text: "Du 15 juin au 15 septembre, on ne peut pas réserver toute la maison. Choisis des pièces individuelles.",
      });
      return;
    }

    setLoading(true);
    const res = await reserver({ chambreIds: selectedIds, arrivee, depart, occupant, personnes, note });
    setLoading(false);

    if (!res.ok) {
      setMessage({ type: "error", text: res.error });
      return;
    }

    setMessage({ type: "success", text: `Réservation enregistrée : ${selectedIds.length} pièce(s), ${nuits} nuit(s) ✓` });
    setSelectedIds([]);
    setOccupant("");
    setPersonnes("");
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className={carte}>
        <h2 className="text-lg font-semibold text-olive-dark">1. Tes dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Arrivée</span>
            <input type="date" className={field} value={arrivee} onChange={(e) => setArrivee(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Départ</span>
            <input type="date" className={field} value={depart} onChange={(e) => setDepart(e.target.value)} />
          </label>
        </div>
        {datesValides && (
          <p className="text-sm text-muted">
            {nuits} nuit(s) · <span className="text-olive-dark">{dispoCount} pièce(s) libre(s)</span>
            {takenIds.length > 0 ? `, ${takenIds.length} déjà prise(s)` : ""}
          </p>
        )}
      </div>

      <div className={carte}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-olive-dark">2. Les pièces</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toutSelectionner}
              disabled={!datesValides || dispoCount === 0 || maisonInterdite}
              className="rounded-full bg-olive/10 px-3 py-1.5 text-sm font-medium text-olive-dark hover:bg-olive/20 disabled:opacity-50"
            >
              🏡 Toute la maison
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-full border border-sand px-3 py-1.5 text-sm text-muted hover:bg-sand/60"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {datesValides && maisonInterdite && (
          <p className="text-xs text-terracotta">
            {ete
              ? "🌞 Du 15 juin au 15 septembre, la maison entière ne peut pas être réservée (partage entre familles). Les pièces restent réservables une par une."
              : "Une pièce est déjà réservée sur ces dates : « toute la maison » est indisponible."}
          </p>
        )}

        {!datesValides ? (
          <p className="rounded-xl border border-dashed border-sand bg-cream p-4 text-sm text-muted">
            Choisis d&apos;abord tes dates pour voir les pièces disponibles.
          </p>
        ) : (
          <>
            <PlanParadou selectedIds={selectedIds} disabledIds={takenIds} onToggle={toggleRoom} />
            {selectedNames.length > 0 && (
              <p className="text-sm text-olive-dark">
                <span className="font-medium">Sélection :</span>{" "}
                {maisonComplete ? "Toute la maison 🏡" : selectedNames.join(", ")}
              </p>
            )}
          </>
        )}
      </div>

      <div className={carte}>
        <h2 className="text-lg font-semibold text-olive-dark">3. Détails</h2>
        <p className="text-sm text-muted">
          Réservé par <span className="font-medium text-ink">{user}</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Nom de l&apos;occupant (si différent)</span>
            <input
              type="text"
              className={field}
              value={occupant}
              onChange={(e) => setOccupant(e.target.value)}
              placeholder="ex : les enfants de Marc"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Personnes (optionnel)</span>
            <input type="number" min="1" className={field} value={personnes} onChange={(e) => setPersonnes(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-muted">Note (optionnel)</span>
            <input type="text" className={field} value={note} onChange={(e) => setNote(e.target.value)} />
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
          {loading
            ? "Enregistrement…"
            : maisonComplete
              ? "Réserver toute la maison"
              : selectedIds.length > 1
                ? `Réserver ${selectedIds.length} pièces`
                : "Réserver"}
        </button>
      </div>
    </form>
  );
}
