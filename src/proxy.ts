import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PUBLIC = ["/login"];
const COOKIE = "paradou_token";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

function versLogin(req: NextRequest) {
  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  const res = NextResponse.redirect(login);
  res.cookies.delete(COOKIE);
  return res;
}

// Vérifie que le jeton de session existe ET correspond à une session valide en base.
// Les pages et actions serveur revérifient la session (getActionnaire) avant tout accès aux données.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !supabase) return versLogin(req);

  const { data, error } = await supabase.rpc("whoami", { p_token: token });
  if (error || !data) return versLogin(req);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
