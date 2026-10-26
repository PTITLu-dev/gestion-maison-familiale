import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const { identifiant, motdepasse } = await req.json();
  if (!identifiant || !motdepasse) {
    return NextResponse.json({ ok: false, error: "Champs manquants." }, { status: 400 });
  }
  const { data, error } = await supabase.rpc("connexion", {
    p_actionnaire: identifiant,
    p_motdepasse: motdepasse,
  });
  if (error) return NextResponse.json({ ok: false, error: "Erreur serveur, réessaie plus tard." }, { status: 500 });

  const token = data as string | null;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Identifiant ou mot de passe incorrect (compte bloqué 15 min après 5 essais)." },
      { status: 401 }
    );
  }

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  const { data: must } = await supabase.rpc("mot_de_passe_a_changer", { p_token: token });
  return NextResponse.json({ ok: true, doitChanger: Boolean(must) });
}
