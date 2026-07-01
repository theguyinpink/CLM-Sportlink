"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = {
  ok: boolean;
  error?: string;
};

type PlayerSettingsInput = {
  is_public: boolean;
  open_to_opportunities: boolean;
  preferred_contact_method: string;
  contact_email_visible_after_accept: boolean;
  phone_visible_after_accept: boolean;
};

type ClubSettingsInput = {
  contact_email: string;
  phone: string;
};

function toBool(value: FormDataEntryValue | null) {
  return value === "on";
}

export async function savePlayerSettingsFromClient(
  input: PlayerSettingsInput,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const payload = {
    is_public: Boolean(input.is_public),
    open_to_opportunities: Boolean(input.open_to_opportunities),
    preferred_contact_method:
      String(input.preferred_contact_method || "email").trim() || "email",
    contact_email_visible_after_accept: Boolean(
      input.contact_email_visible_after_accept,
    ),
    phone_visible_after_accept: Boolean(input.phone_visible_after_accept),
  };

  const { error } = await supabase
    .from("player_profiles")
    .update(payload)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/joueur/parametres");
  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/joueur/demandes");
  revalidatePath("/app/club/joueurs/[id]");

  return { ok: true };
}

export async function saveClubSettingsFromClient(
  input: ClubSettingsInput,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const payload = {
    contact_email: String(input.contact_email || "").trim() || null,
    phone: String(input.phone || "").trim() || null,
  };

  const { error } = await supabase
    .from("clubs")
    .update(payload)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/club/parametres");
  revalidatePath("/app/club/profil");
  revalidatePath("/app/joueur/clubs/[id]");

  return { ok: true };
}

export async function savePlayerSettings(formData: FormData) {
  const result = await savePlayerSettingsFromClient({
    is_public: toBool(formData.get("is_public")),
    open_to_opportunities: toBool(formData.get("open_to_opportunities")),
    preferred_contact_method: String(
      formData.get("preferred_contact_method") || "email",
    ),
    contact_email_visible_after_accept: toBool(
      formData.get("contact_email_visible_after_accept"),
    ),
    phone_visible_after_accept: toBool(
      formData.get("phone_visible_after_accept"),
    ),
  });

  if (!result.ok) {
    redirect(`/app/joueur/parametres?error=${encodeURIComponent(result.error || "Erreur paramètres")}`);
  }

  redirect("/app/joueur/parametres?message=Paramètres enregistrés");
}

export async function saveClubSettings(formData: FormData) {
  const result = await saveClubSettingsFromClient({
    contact_email: String(formData.get("contact_email") || ""),
    phone: String(formData.get("phone") || ""),
  });

  if (!result.ok) {
    redirect(`/app/club/parametres?error=${encodeURIComponent(result.error || "Erreur paramètres")}`);
  }

  redirect("/app/club/parametres?message=Paramètres enregistrés");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
