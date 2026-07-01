function cleanEnvValue(value?: string | null) {
  return (value || "").trim().replace(/^['\"]|['\"]$/g, "");
}

export function getSupabaseUrl() {
  const raw = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local. Ajoute l’URL du projet Supabase puis redémarre npm run dev.",
    );
  }

  try {
    const parsed = new URL(raw);
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL invalide. Elle doit ressembler à https://xxxx.supabase.co, sans /auth/v1 ni autre chemin.",
    );
  }
}

export function getSupabaseAnonKey() {
  const key =
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!key) {
    throw new Error(
      "Clé Supabase publique manquante. Ajoute NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local puis redémarre npm run dev.",
    );
  }

  return key;
}

export function getSupabaseServiceRoleKey() {
  return cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseConfig() {
  return {
    url: getSupabaseUrl(),
    key: getSupabaseAnonKey(),
  };
}
