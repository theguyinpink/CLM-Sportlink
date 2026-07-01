"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FavoriteTargetType = "club_offer" | "club" | "player_profile" | "post";

type ActionResult = {
  ok: boolean;
  error?: string;
  saved?: boolean;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function normalizeTargetType(value?: string | null): FavoriteTargetType | null {
  const safe = clean(value);
  if (["club_offer", "club", "player_profile", "post"].includes(safe)) {
    return safe as FavoriteTargetType;
  }
  return null;
}

function revalidateFavorites() {
  revalidatePath("/app/joueur/favoris");
  revalidatePath("/app/club/favoris");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/app/club/joueurs");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/club/feed");
}

export async function toggleFavoriteFromClient(input: {
  target_type: string;
  target_id: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const targetType = normalizeTargetType(input.target_type);
  const targetId = clean(input.target_id);

  if (!targetType || !targetId) {
    return { ok: false, error: "Favori introuvable." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  if (existing?.id) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };
    revalidateFavorites();
    return { ok: true, saved: false };
  }

  const { error } = await supabase.from("saved_items").insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
  });

  if (error) return { ok: false, error: error.message };

  revalidateFavorites();
  return { ok: true, saved: true };
}
