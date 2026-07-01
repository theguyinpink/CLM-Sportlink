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
  revalidatePath("/app/club/joueurs");
  revalidatePath("/app/joueur/clubs");
}

async function safeRun(action: () => Promise<unknown>) {
  try {
    await action();
  } catch {
    // Certaines tables/colonnes peuvent ne pas exister selon les migrations déjà appliquées.
  }
}

async function removeStoragePaths(supabase: any, bucket: string, paths: Array<string | null | undefined>) {
  const cleanPaths = paths.map((path) => String(path || "").trim()).filter(Boolean);
  if (cleanPaths.length === 0) return;

  await safeRun(async () => {
    await supabase.storage.from(bucket).remove(cleanPaths);
  });
}

async function deletePostsByIds(supabase: any, postIds: string[]) {
  const ids = Array.from(new Set(postIds.filter(Boolean)));
  if (ids.length === 0) return;

  const { data: media } = await supabase
    .from("post_media")
    .select("storage_path")
    .in("post_id", ids);

  await removeStoragePaths(
    supabase,
    "post-media",
    (media || []).map((item: any) => item.storage_path),
  );

  await safeRun(async () => await supabase.from("post_media").delete().in("post_id", ids));
  await safeRun(async () => await supabase.from("post_likes").delete().in("post_id", ids));
  await safeRun(async () => await supabase.from("post_comments").delete().in("post_id", ids));
  await safeRun(async () => await supabase.from("saved_items").delete().eq("target_type", "post").in("target_id", ids));
  await safeRun(async () => await supabase.from("content_reports").delete().eq("target_type", "post").in("target_id", ids));
  await safeRun(async () => await supabase.from("posts").delete().in("id", ids));
}

async function deletePostsForEntity(
  supabase: any,
  options: { userId?: string | null; playerProfileId?: string | null; clubId?: string | null },
) {
  const postIds = new Set<string>();

  if (options.playerProfileId) {
    const { data } = await supabase.from("posts").select("id").eq("player_profile_id", options.playerProfileId);
    (data || []).forEach((post: any) => postIds.add(post.id));
  }

  if (options.clubId) {
    const { data } = await supabase.from("posts").select("id").eq("club_id", options.clubId);
    (data || []).forEach((post: any) => postIds.add(post.id));
  }

  if (options.userId) {
    await safeRun(async () => {
      const { data } = await supabase.from("posts").select("id").or(`author_user_id.eq.${options.userId},user_id.eq.${options.userId}`);
      (data || []).forEach((post: any) => postIds.add(post.id));
    });
  }

  await deletePostsByIds(supabase, Array.from(postIds));
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
    await deletePostsByIds(supabase, [id]);

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

export async function adminDeletePlayerProfile(profileId: string): Promise<AdminActionResult> {
  try {
    const id = clean(profileId);
    if (!id) return { ok: false, error: "Profil introuvable." };

    const supabase = await requireAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("player_profiles")
      .select("id, user_id, avatar_path")
      .eq("id", id)
      .maybeSingle();

    if (profileError) return { ok: false, error: profileError.message };
    if (!profile) return { ok: false, error: "Profil introuvable." };

    const { data: media } = await supabase
      .from("player_media")
      .select("storage_path")
      .eq("player_profile_id", id);

    await removeStoragePaths(supabase, "avatars", [profile.avatar_path]);
    await removeStoragePaths(supabase, "player-media", (media || []).map((item: any) => item.storage_path));

    await deletePostsForEntity(supabase, { userId: profile.user_id, playerProfileId: id });

    await safeRun(async () => await supabase.from("player_media").delete().eq("player_profile_id", id));
    await safeRun(async () => await supabase.from("connection_requests").delete().eq("player_profile_id", id));
    await safeRun(async () => await supabase.from("saved_items").delete().eq("target_type", "player_profile").eq("target_id", id));
    await safeRun(async () => await supabase.from("content_reports").delete().eq("target_type", "player_profile").eq("target_id", id));

    if (profile.user_id) {
      await safeRun(async () => await supabase.from("saved_items").delete().eq("user_id", profile.user_id));
      await safeRun(async () => await supabase.from("post_likes").delete().eq("user_id", profile.user_id));
      await safeRun(async () => await supabase.from("post_comments").delete().eq("user_id", profile.user_id));
    }

    const { error: deleteError } = await supabase.from("player_profiles").delete().eq("id", id);
    if (deleteError) return { ok: false, error: deleteError.message };

    if (profile.user_id) {
      await safeRun(async () => await supabase.auth.admin.deleteUser(profile.user_id));
    }

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}

export async function adminDeleteClub(clubId: string): Promise<AdminActionResult> {
  try {
    const id = clean(clubId);
    if (!id) return { ok: false, error: "Club introuvable." };

    const supabase = await requireAdminClient();
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("id, user_id, logo_path")
      .eq("id", id)
      .maybeSingle();

    if (clubError) return { ok: false, error: clubError.message };
    if (!club) return { ok: false, error: "Club introuvable." };

    await removeStoragePaths(supabase, "club-logos", [club.logo_path]);
    await deletePostsForEntity(supabase, { userId: club.user_id, clubId: id });

    await safeRun(async () => await supabase.from("club_offers").delete().eq("club_id", id));
    await safeRun(async () => await supabase.from("connection_requests").delete().eq("club_id", id));
    await safeRun(async () => await supabase.from("saved_items").delete().eq("target_type", "club").eq("target_id", id));
    await safeRun(async () => await supabase.from("content_reports").delete().eq("target_type", "club").eq("target_id", id));

    if (club.user_id) {
      await safeRun(async () => await supabase.from("saved_items").delete().eq("user_id", club.user_id));
      await safeRun(async () => await supabase.from("post_likes").delete().eq("user_id", club.user_id));
      await safeRun(async () => await supabase.from("post_comments").delete().eq("user_id", club.user_id));
    }

    const { error: deleteError } = await supabase.from("clubs").delete().eq("id", id);
    if (deleteError) return { ok: false, error: deleteError.message };

    if (club.user_id) {
      await safeRun(async () => await supabase.auth.admin.deleteUser(club.user_id));
    }

    revalidateAdminSurfaces();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erreur admin." };
  }
}
