"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  error?: string;
};

type CreateClubOfferInput = {
  title: string;
  offer_type?: string | null;
  category: string;
  description: string;
  position_needed: string;
  level_required: string;
  age_min?: number | null;
  age_max?: number | null;
  location: string;
  event_date?: string | null;
  event_time?: string | null;
  remuneration?: string | null;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function normalizeValue(value?: string | null) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeOfferType(value?: string | null) {
  const type = normalizeValue(value);

  if (type === "referee" || type === "arbitre" || type === "arbitrage" || type.includes("arbitr")) {
    return "referee";
  }

  if (type === "staff" || type === "coach" || type.includes("staff") || type.includes("coach")) {
    return "staff";
  }

  return "player";
}

function categoryForType(category: string, offerType: string) {
  if (offerType === "referee") return "arbitre";
  if (offerType === "staff") return "staff";

  const cleanCategory = clean(category) || "recrutement";

  // Une annonce joueur ne doit jamais garder une catégorie arbitre/staff par erreur.
  if (cleanCategory === "arbitre" || cleanCategory === "staff") return "recrutement";

  return cleanCategory;
}

async function getOwnedClubId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, clubId: null, error: "Tu dois être connecté." };

  const { data: club, error } = await supabase
    .from("clubs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { supabase, clubId: null, error: error.message };
  if (!club) return { supabase, clubId: null, error: "Crée d'abord ta fiche club." };

  return { supabase, clubId: club.id as string, error: null };
}

function revalidateOfferPages() {
  revalidatePath("/app/club/annonces");
  revalidatePath("/app/club/feed");
  revalidatePath("/app/club/joueurs");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/clubs");
  revalidatePath("/joueurs");
}

export async function createClubOfferFromClient(
  input: CreateClubOfferInput,
): Promise<ActionResult> {
  const { supabase, clubId, error: ownershipError } = await getOwnedClubId();

  if (ownershipError || !clubId) {
    return { ok: false, error: ownershipError || "Club introuvable." };
  }

  const title = clean(input.title);
  const offer_type = normalizeOfferType(input.offer_type);
  const category = categoryForType(clean(input.category), offer_type);
  const description = clean(input.description);
  const position_needed = clean(input.position_needed);
  const level_required = clean(input.level_required);
  const location = clean(input.location);
  const event_date = clean(input.event_date) || null;
  const event_time = clean(input.event_time) || null;
  const remuneration = clean(input.remuneration) || null;

  const age_min =
    typeof input.age_min === "number" && Number.isFinite(input.age_min)
      ? input.age_min
      : null;

  const age_max =
    typeof input.age_max === "number" && Number.isFinite(input.age_max)
      ? input.age_max
      : null;

  if (!title) return { ok: false, error: "Titre obligatoire." };

  const { error } = await supabase.from("club_offers").insert({
    club_id: clubId,
    title,
    offer_type,
    category,
    description,
    position_needed,
    level_required,
    age_min,
    age_max,
    location,
    event_date,
    event_time,
    remuneration,
    status: "active",
  });

  if (error) return { ok: false, error: error.message };

  revalidateOfferPages();

  return { ok: true };
}

export async function createClubOffer(formData: FormData) {
  const age_min_raw = String(formData.get("age_min") || "").trim();
  const age_max_raw = String(formData.get("age_max") || "").trim();

  const result = await createClubOfferFromClient({
    title: String(formData.get("title") || ""),
    offer_type: String(formData.get("offer_type") || "player"),
    category: String(formData.get("category") || "recrutement"),
    description: String(formData.get("description") || ""),
    position_needed: String(formData.get("position_needed") || ""),
    level_required: String(formData.get("level_required") || ""),
    location: String(formData.get("location") || ""),
    age_min: age_min_raw ? Number(age_min_raw) : null,
    age_max: age_max_raw ? Number(age_max_raw) : null,
    event_date: String(formData.get("event_date") || ""),
    event_time: String(formData.get("event_time") || ""),
    remuneration: String(formData.get("remuneration") || ""),
  });

  if (!result.ok) {
    redirect(`/app/club/annonces/new?error=${encodeURIComponent(result.error || "Erreur annonce")}`);
  }

  redirect("/app/club/annonces?message=Annonce+créée");
}

type UpdateClubOfferInput = CreateClubOfferInput & {
  id: string;
  status?: string | null;
};

export async function updateClubOfferFromClient(
  input: UpdateClubOfferInput,
): Promise<ActionResult> {
  const { supabase, clubId, error: ownershipError } = await getOwnedClubId();

  if (ownershipError || !clubId) {
    return { ok: false, error: ownershipError || "Club introuvable." };
  }

  const id = clean(input.id);
  const title = clean(input.title);
  const offer_type = normalizeOfferType(input.offer_type);
  const category = categoryForType(clean(input.category), offer_type);
  const description = clean(input.description);
  const position_needed = clean(input.position_needed);
  const level_required = clean(input.level_required);
  const location = clean(input.location);
  const status = clean(input.status) || "active";
  const event_date = clean(input.event_date) || null;
  const event_time = clean(input.event_time) || null;
  const remuneration = clean(input.remuneration) || null;

  const age_min =
    typeof input.age_min === "number" && Number.isFinite(input.age_min)
      ? input.age_min
      : null;

  const age_max =
    typeof input.age_max === "number" && Number.isFinite(input.age_max)
      ? input.age_max
      : null;

  if (!id) return { ok: false, error: "Annonce introuvable." };
  if (!title) return { ok: false, error: "Titre obligatoire." };

  const { error } = await supabase
    .from("club_offers")
    .update({
      title,
      offer_type,
      category,
      description,
      position_needed,
      level_required,
      age_min,
      age_max,
      location,
      event_date,
      event_time,
      remuneration,
      status,
    })
    .eq("id", id)
    .eq("club_id", clubId);

  if (error) return { ok: false, error: error.message };

  revalidateOfferPages();

  return { ok: true };
}

export async function deleteClubOfferFromClient(id: string): Promise<ActionResult> {
  const { supabase, clubId, error: ownershipError } = await getOwnedClubId();

  if (ownershipError || !clubId) {
    return { ok: false, error: ownershipError || "Club introuvable." };
  }

  const offerId = clean(id);
  if (!offerId) return { ok: false, error: "Annonce introuvable." };

  const { error } = await supabase
    .from("club_offers")
    .delete()
    .eq("id", offerId)
    .eq("club_id", clubId);

  if (error) return { ok: false, error: error.message };

  revalidateOfferPages();

  return { ok: true };
}
