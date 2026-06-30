import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const COOKIE = "paradou_token";

export async function getActionnaire(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await supabase.rpc("whoami", { p_token: token });
  return (data as string | null) ?? null;
}
