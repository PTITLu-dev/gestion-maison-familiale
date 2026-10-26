import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const COOKIE = "paradou_token";

export async function getActionnaire(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await supabase.rpc("whoami", { p_token: token });
  return (data as string | null) ?? null;
}

// À appeler en tête de chaque page qui lit des données : renvoie l'actionnaire connecté,
// ou redirige vers /login. Double la vérification faite dans proxy.ts.
export async function exigerActionnaire(): Promise<string> {
  const user = await getActionnaire();
  if (!user) redirect("/login");
  return user;
}
