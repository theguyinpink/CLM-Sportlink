"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin";

type AdminActionResult = {
  ok: boolean;
  error?: string;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function revalidateAdminSurfaces() {
  revalidatePath("/app/admin");
  revalidatePath("/app/joueur/fil");
  revalidatePath("/app/club/fil");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/club/feed");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/club/annonces");
}

export async function adminHidePost(postId: string): Promise<AdminActionResult> {
  try {
    const id = clean(postId);
    if (!id) return { ok: false, error: "Publication introuvable." };

    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("posts")
      .update({ visibility: "hidden", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}

export async function adminRestorePost(postId: string): Promise<AdminActionResult> {
  try {
    const id = clean(postId);
    if (!id) return { ok: false, error: "Publication introuvable." };

    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("posts")
      .update({ visibility: "public", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}

export async function adminDeletePost(postId: string): Promise<AdminActionResult> {
  try {
    const id = clean(postId);
    if (!id) return { ok: false, error: "Publication introuvable." };

    const supabase = await requireAdminClient();

    const { data: media } = await supabase
      .from("post_media")
      .select("storage_path")
      .eq("post_id", id);

    const paths = (media || [])
      .map((item) => item.storage_path)
      .filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from("post-media").remove(paths);
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}

export async function adminDeactivateOffer(offerId: string): Promise<AdminActionResult> {
  try {
    const id = clean(offerId);
    if (!id) return { ok: false, error: "Annonce introuvable." };

    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("club_offers")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}

export async function adminReactivateOffer(offerId: string): Promise<AdminActionResult> {
  try {
    const id = clean(offerId);
    if (!id) return { ok: false, error: "Annonce introuvable." };

    const supabase = await requireAdminClient();
    const { error } = await supabase
      .from("club_offers")
      .update({ status: "active" })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}
