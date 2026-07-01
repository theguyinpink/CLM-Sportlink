"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthResult = {
  ok: boolean;
  error?: string;
  role?: "player" | "club";
};

export async function signUpPlayerFromClient(input: {
  email: string;
  password: string;
  profileRole?: "player" | "referee" | "staff";
}): Promise<AuthResult> {
  const supabase = await createClient();

  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "").trim();
  const profileRole = ["player", "referee", "staff"].includes(String(input.profileRole || ""))
    ? String(input.profileRole)
    : "player";

  if (!email || !password) {
    return { ok: false, error: "Email ou mot de passe manquant." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "player", profile_role: profileRole } },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, role: "player" };
}

export async function signUpClubFromClient(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();

  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "").trim();

  if (!email || !password) {
    return { ok: false, error: "Email ou mot de passe manquant." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "club" } },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, role: "club" };
}

export async function signUpPlayer(formData: FormData) {
  const result = await signUpPlayerFromClient({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    profileRole: String(formData.get("profile_role") || "player") as "player" | "referee" | "staff",
  });

  if (!result.ok) {
    redirect(`/inscription/joueur?error=${encodeURIComponent(result.error || "Erreur inscription")}`);
  }

  redirect("/connexion?message=Compte+joueur+créé");
}

export async function signUpClub(formData: FormData) {
  const result = await signUpClubFromClient({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  if (!result.ok) {
    redirect(`/inscription/club?error=${encodeURIComponent(result.error || "Erreur inscription")}`);
  }

  redirect("/connexion?message=Compte+club+créé");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect("/connexion?error=Email+ou+mot+de+passe+manquant");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/connexion?error=${encodeURIComponent(error.message)}`);
  }

  const role = data.user?.user_metadata?.role;

  if (role === "club") redirect("/app/club/feed");
  redirect("/app/joueur/feed");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
