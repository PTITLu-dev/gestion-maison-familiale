import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { COOKIE } from "@/lib/session";

export async function POST() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (token) await supabase.rpc("deconnexion", { p_token: token });
  c.delete(COOKIE);
  return NextResponse.json({ ok: true });
}
