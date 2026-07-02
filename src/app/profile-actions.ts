"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  error?: string;
};

type SaveClubProfileInput = {
  club_name: string;
  sport: string;
  city: string;
  region: string;
  level: string;
  description: string;
  contact_email: string;
  phone: string;
};

type SavePlayerProfileInput = {
  display_name: string;
  sport: string;
  position: string;
  level: string;
  city: string;
  region: string;
  bio: string;
  contact_email: string;
  phone: string;
  contact_email_visible_after_accept: boolean;
  phone_visible_after_accept: boolean;
  roles_available?: string[];
  referee_sports?: string;
  referee_level?: string;
  referee_city?: string;
  referee_radius_km?: number | null;
  referee_availability?: string;
  referee_experience?: string;
  staff_roles?: string;
  staff_experience?: string;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function normalizeProfileRole(value?: unknown): "player" | "referee" | "staff" {
  return value === "referee" || value === "staff" || value === "player" ? value : "player";
}

function normalizeRoles(values?: string[], fallback: "player" | "referee" | "staff" = "player") {
  const allowed = new Set(["player", "referee", "staff"]);
  const roles = (values || [])
    .map((value) => String(value || "").trim())
    .filter((value) => allowed.has(value));

  return roles.length ? Array.from(new Set(roles)) : [fallback];
}

export async function saveClubProfileFromClient(
  input: SaveClubProfileInput,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const club_name = clean(input.club_name);
  const sport = clean(input.sport);
  const city = clean(input.city);
  const region = clean(input.region);
  const level = clean(input.level);
  const description = clean(input.description);
  const contact_email = clean(input.contact_email);
  const phone = clean(input.phone);

  if (!club_name || !sport) {
    return { ok: false, error: "Nom du club et sport obligatoires." };
  }

  const { error } = await supabase.from("clubs").upsert(
    {
      user_id: user.id,
      club_name,
      sport,
      city,
      region,
      level,
      description,
      contact_email: contact_email || null,
      phone: phone || null,
    },
    { onConflict: "user_id" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/club/profil");
  revalidatePath("/app/club/profil/edit");
  revalidatePath("/app/club/feed");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/clubs");

  return { ok: true };
}

export async function savePlayerProfileFromClient(
  input: SavePlayerProfileInput,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const display_name = clean(input.display_name);
  const sport = clean(input.sport);
  const position = clean(input.position);
  const level = clean(input.level);
  const city = clean(input.city);
  const region = clean(input.region);
  const bio = clean(input.bio);
  const contact_email = clean(input.contact_email);
  const phone = clean(input.phone);
  const defaultProfileRole = normalizeProfileRole(user.user_metadata?.profile_role);
  const roles_available = normalizeRoles(input.roles_available, defaultProfileRole);
  const referee_sports = clean(input.referee_sports);
  const referee_level = clean(input.referee_level);
  const referee_city = clean(input.referee_city);
  const referee_radius_km =
    typeof input.referee_radius_km === "number" && Number.isFinite(input.referee_radius_km)
      ? input.referee_radius_km
      : null;
  const referee_availability = clean(input.referee_availability);
  const referee_experience = clean(input.referee_experience);
  const staff_roles = clean(input.staff_roles);
  const staff_experience = clean(input.staff_experience);

  if (!display_name || !sport) {
    return { ok: false, error: "Nom affiché et sport obligatoires." };
  }

  const { error } = await supabase.from("player_profiles").upsert(
    {
      user_id: user.id,
      display_name,
      sport,
      position,
      level,
      city,
      region,
      bio,
      contact_email: contact_email || null,
      phone: phone || null,
      contact_email_visible_after_accept:
        Boolean(input.contact_email_visible_after_accept),
      phone_visible_after_accept: Boolean(input.phone_visible_after_accept),
      roles_available,
      referee_sports: referee_sports || null,
      referee_level: referee_level || null,
      referee_city: referee_city || null,
      referee_radius_km,
      referee_availability: referee_availability || null,
      referee_experience: referee_experience || null,
      staff_roles: staff_roles || null,
      staff_experience: staff_experience || null,
    },
    { onConflict: "user_id" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/joueur/profil/edit");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/club/joueurs");
  revalidatePath("/joueurs");

  return { ok: true };
}

export async function saveClubProfile(formData: FormData) {
  const result = await saveClubProfileFromClient({
    club_name: String(formData.get("club_name") || ""),
    sport: String(formData.get("sport") || ""),
    city: String(formData.get("city") || ""),
    region: String(formData.get("region") || ""),
    level: String(formData.get("level") || ""),
    description: String(formData.get("description") || ""),
    contact_email: String(formData.get("contact_email") || ""),
    phone: String(formData.get("phone") || ""),
  });

  if (!result.ok) {
    redirect(`/app/club/profil/edit?error=${encodeURIComponent(result.error || "Erreur profil")}`);
  }

  redirect("/app/club/profil");
}

export async function savePlayerProfile(formData: FormData) {
  const result = await savePlayerProfileFromClient({
    display_name: String(formData.get("display_name") || ""),
    sport: String(formData.get("sport") || ""),
    position: String(formData.get("position") || ""),
    level: String(formData.get("level") || ""),
    city: String(formData.get("city") || ""),
    region: String(formData.get("region") || ""),
    bio: String(formData.get("bio") || ""),
    contact_email: String(formData.get("contact_email") || ""),
    phone: String(formData.get("phone") || ""),
    contact_email_visible_after_accept:
      formData.get("contact_email_visible_after_accept") === "on",
    phone_visible_after_accept: formData.get("phone_visible_after_accept") === "on",
    roles_available: formData.getAll("roles_available").map(String),
    referee_sports: String(formData.get("referee_sports") || ""),
    referee_level: String(formData.get("referee_level") || ""),
    referee_city: String(formData.get("referee_city") || ""),
    referee_radius_km: formData.get("referee_radius_km")
      ? Number(formData.get("referee_radius_km"))
      : null,
    referee_availability: String(formData.get("referee_availability") || ""),
    referee_experience: String(formData.get("referee_experience") || ""),
    staff_roles: String(formData.get("staff_roles") || ""),
    staff_experience: String(formData.get("staff_experience") || ""),
  });

  if (!result.ok) {
    redirect(`/app/joueur/profil/edit?error=${encodeURIComponent(result.error || "Erreur profil")}`);
  }

  redirect("/app/joueur/profil");
}
