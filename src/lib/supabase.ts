import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client serveur uniquement : la clé service_role ne doit jamais atteindre le navigateur
// (pas de préfixe NEXT_PUBLIC_, et « server-only » fait échouer le build si un composant client l'importe).
// Toutes les lectures/écritures passent par le serveur, après vérification de la session.

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
