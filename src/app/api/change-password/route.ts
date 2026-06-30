import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const { ancien, nouveau } = await req.json();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "Non connecté." }, { status: 401 });

  const { data, error } = await supabase.rpc("changer_mot_de_passe", {
    p_token: token,
    p_ancien: ancien,
    p_nouveau: nouveau,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const code = data as string;
  if (code === "ok") return NextResponse.json({ ok: true });
  const messages: Record<string, string> = {
    session: "Session expirée, reconnecte-toi.",
    court: "Le nouveau mot de passe doit faire au moins 6 caractères.",
    mauvais: "L'ancien mot de passe est incorrect.",
  };
  return NextResponse.json({ ok: false, error: messages[code] ?? "Erreur." }, { status: 400 });
}
