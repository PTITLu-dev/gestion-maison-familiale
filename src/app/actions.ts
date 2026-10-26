"use server";

import { supabase } from "@/lib/supabase";
import { getActionnaire } from "@/lib/session";
import { CHAMBRES } from "@/lib/chambres";
import { COULEURS_POSTIT } from "@/lib/postits";
import { TYPE_LABEL } from "@/lib/evenements";

// Toutes les écritures (et les lectures déclenchées depuis le navigateur) passent par ces
// actions serveur : la session est vérifiée à chaque appel, et l'auteur est déduit du cookie,
// jamais de ce que le navigateur envoie.

export type Resultat = { ok: true } | { ok: false; error: string };

const NON_CONNECTE: Resultat = { ok: false, error: "Session expirée, reconnecte-toi." };
const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

function texte(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function dateIso(v: unknown): string | null {
  return typeof v === "string" && DATE_ISO.test(v) ? v : null;
}

function entier(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function chevaucheEte(arrivee: string, depart: string) {
  const ya = Number(arrivee.slice(0, 4));
  const yd = Number(depart.slice(0, 4));
  for (let y = ya; y <= yd; y++) {
    if (arrivee < `${y}-09-16` && depart > `${y}-06-15`) return true;
  }
  return false;
}

// ---------- Réservations ----------

export async function chambresPrises(arrivee: string, depart: string): Promise<number[]> {
  if (!(await getActionnaire())) return [];
  const a = dateIso(arrivee);
  const d = dateIso(depart);
  if (!a || !d || d <= a) return [];
  const { data } = await supabase
    .from("reservations")
    .select("chambre_id")
    .lt("arrivee", d)
    .gt("depart", a);
  return Array.from(new Set(((data ?? []) as { chambre_id: number }[]).map((r) => r.chambre_id)));
}

export async function reserver(input: {
  chambreIds: number[];
  arrivee: string;
  depart: string;
  occupant?: string;
  personnes?: string;
  note?: string;
}): Promise<Resultat> {
  const user = await getActionnaire();
  if (!user) return NON_CONNECTE;

  const arrivee = dateIso(input.arrivee);
  const depart = dateIso(input.depart);
  if (!arrivee || !depart || depart <= arrivee) {
    return { ok: false, error: "Choisis une date d'arrivée et une date de départ valides." };
  }
  const idsValides = new Set(CHAMBRES.map((c) => c.id));
  const ids = Array.from(new Set(Array.isArray(input.chambreIds) ? input.chambreIds : [])).filter((id) =>
    idsValides.has(id)
  );
  if (ids.length === 0) return { ok: false, error: "Sélectionne au moins une pièce." };
  if (chevaucheEte(arrivee, depart) && ids.length === CHAMBRES.length) {
    return {
      ok: false,
      error: "Du 15 juin au 15 septembre, on ne peut pas réserver toute la maison. Choisis des pièces individuelles.",
    };
  }

  const { data: conflits } = await supabase
    .from("reservations")
    .select("chambres(nom)")
    .in("chambre_id", ids)
    .lt("arrivee", depart)
    .gt("depart", arrivee);
  const liste = (conflits ?? []) as unknown as { chambres: { nom: string } | null }[];
  if (liste.length > 0) {
    const noms = Array.from(new Set(liste.map((c) => c.chambres?.nom).filter(Boolean)));
    return { ok: false, error: `Déjà réservé sur ces dates : ${noms.join(", ")}.` };
  }

  const personnes = input.personnes ? entier(input.personnes, 1, 100) : null;
  const rows = ids.map((id) => ({
    chambre_id: id,
    famille: user,
    occupant: texte(input.occupant, 120),
    arrivee,
    depart,
    personnes,
    note: texte(input.note),
  }));
  const { error } = await supabase.from("reservations").insert(rows);
  if (error) {
    return {
      ok: false,
      error: error.code === "23P01" ? "Une pièce vient d'être prise sur ces dates. Réessaie." : "Erreur à l'enregistrement.",
    };
  }
  return { ok: true };
}

// ---------- Naissances ----------

export async function ajouterNaissance(input: {
  nom: string;
  jour: string;
  mois: string;
  annee?: string;
}): Promise<Resultat> {
  if (!(await getActionnaire())) return NON_CONNECTE;
  const nom = texte(input.nom, 120);
  const jour = entier(input.jour, 1, 31);
  const mois = entier(input.mois, 1, 12);
  if (!nom || !jour || !mois) return { ok: false, error: "Indique au moins un prénom, un jour et un mois." };
  const annee = input.annee ? entier(input.annee, 1800, 2200) : null;
  const { error } = await supabase.from("naissances").insert({ nom, jour, mois, annee });
  return error ? { ok: false, error: "Erreur à l'enregistrement." } : { ok: true };
}

// ---------- Événements ----------

export async function ajouterEvenement(input: {
  titre: string;
  type: string;
  date: string;
  heure?: string;
  lieu?: string;
}): Promise<Resultat> {
  const user = await getActionnaire();
  if (!user) return NON_CONNECTE;
  const titre = texte(input.titre, 200);
  const date = dateIso(input.date);
  if (!titre || !date) return { ok: false, error: "Indique un titre et une date." };
  const type = input.type in TYPE_LABEL ? input.type : "evenement";
  const { error } = await supabase.from("evenements").insert({
    titre,
    type,
    date,
    heure: texte(input.heure, 20),
    lieu: texte(input.lieu, 200),
    auteur: user,
  });
  return error ? { ok: false, error: "Erreur à l'enregistrement." } : { ok: true };
}

// ---------- Fournisseurs ----------

type FournisseurInput = {
  objet: string;
  intervenant?: string;
  adresse?: string;
  email?: string;
  telephone?: string;
  date_intervention?: string;
};

function champsFournisseur(input: FournisseurInput) {
  return {
    objet: texte(input.objet, 200),
    intervenant: texte(input.intervenant, 200),
    adresse: texte(input.adresse, 300),
    email: texte(input.email, 200),
    telephone: texte(input.telephone, 40),
    date_intervention: dateIso(input.date_intervention),
  };
}

export async function ajouterFournisseur(input: FournisseurInput): Promise<Resultat> {
  if (!(await getActionnaire())) return NON_CONNECTE;
  const champs = champsFournisseur(input);
  if (!champs.objet) return { ok: false, error: "Indique au moins l'objet (ex : Toiture)." };
  const { error } = await supabase.from("fournisseurs").insert(champs);
  return error ? { ok: false, error: "Erreur à l'enregistrement." } : { ok: true };
}

export async function modifierFournisseur(id: string, input: FournisseurInput): Promise<Resultat> {
  if (!(await getActionnaire())) return NON_CONNECTE;
  const champs = champsFournisseur(input);
  if (typeof id !== "string" || !id) return { ok: false, error: "Fournisseur inconnu." };
  if (!champs.objet) return { ok: false, error: "Indique au moins l'objet (ex : Toiture)." };
  const { error } = await supabase.from("fournisseurs").update(champs).eq("id", id);
  return error ? { ok: false, error: "Erreur à l'enregistrement." } : { ok: true };
}

// ---------- Post-its ----------

export async function ajouterPostit(input: { nom: string; texte: string; couleur: string }): Promise<Resultat> {
  const user = await getActionnaire();
  if (!user) return NON_CONNECTE;
  const auteur = texte(input.nom, 80);
  const contenu = texte(input.texte, 1000);
  if (!auteur || !contenu) return { ok: false, error: "Indique un nom et écris un petit mot." };
  const couleur = input.couleur in COULEURS_POSTIT ? input.couleur : "jaune";
  const { error } = await supabase.from("postits").insert({ auteur, compte: user, texte: contenu, couleur });
  return error ? { ok: false, error: "Erreur à l'enregistrement." } : { ok: true };
}
