"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "bin" : "bin";
}

function sanitizeFilename(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildStoragePath(userId: string, prefix: string, originalName: string) {
  const ext = getFileExtension(originalName);
  const base = sanitizeFilename(originalName.replace(/\.[^.]+$/, "")) || "file";
  return `${userId}/${prefix}-${Date.now()}-${base}.${ext}`;
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function uploadPlayerAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError("/app/joueur/parametres", "Aucun fichier avatar valide");
  }

  if (!isImage(file)) {
    redirectWithError("/app/joueur/parametres", "Le fichier doit être une image");
  }

  if (file.size > 5 * 1024 * 1024) {
    redirectWithError("/app/joueur/parametres", "Image trop lourde (max 5 Mo)");
  }

  const { data: profile, error: profileError } = await supabase
    .from("player_profiles")
    .select("avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    redirectWithError("/app/joueur/parametres", profileError.message);
  }

  const filePath = buildStoragePath(user.id, "avatar", file.name);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    redirectWithError("/app/joueur/parametres", uploadError.message);
  }

  if (profile?.avatar_path) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }

  const { error: updateError } = await supabase
    .from("player_profiles")
    .update({ avatar_path: filePath })
    .eq("user_id", user.id);

  if (updateError) {
    redirectWithError("/app/joueur/parametres", updateError.message);
  }

  revalidatePath("/app/joueur/parametres");
  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/joueur/demandes");
  revalidatePath("/app/club/joueurs");
  revalidatePath("/app/club/joueurs/[id]");
  revalidatePath("/app/club/notifications");
  revalidatePath("/app/club/demandes");
  revalidatePath("/joueurs");
  revalidatePath("/joueurs/[id]");

  redirectWithMessage("/app/joueur/parametres", "Avatar mis à jour");
}

export async function deletePlayerAvatar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile, error: profileError } = await supabase
    .from("player_profiles")
    .select("avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    redirectWithError("/app/joueur/parametres", profileError.message);
  }

  if (profile?.avatar_path) {
    await supabase.storage.from("avatars").remove([profile.avatar_path]);
  }

  const { error } = await supabase
    .from("player_profiles")
    .update({ avatar_path: null })
    .eq("user_id", user.id);

  if (error) {
    redirectWithError("/app/joueur/parametres", error.message);
  }

  revalidatePath("/app/joueur/parametres");
  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/app/joueur/demandes");
  revalidatePath("/app/club/joueurs");
  revalidatePath("/app/club/joueurs/[id]");
  revalidatePath("/app/club/notifications");
  revalidatePath("/app/club/demandes");
  revalidatePath("/joueurs");
  revalidatePath("/joueurs/[id]");

  redirectWithMessage("/app/joueur/parametres", "Avatar supprimé");
}

export async function uploadClubLogo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError("/app/club/parametres", "Aucun fichier logo valide");
  }

  if (!isImage(file)) {
    redirectWithError("/app/club/parametres", "Le fichier doit être une image");
  }

  if (file.size > 5 * 1024 * 1024) {
    redirectWithError("/app/club/parametres", "Image trop lourde (max 5 Mo)");
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("logo_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clubError) {
    redirectWithError("/app/club/parametres", clubError.message);
  }

  const filePath = buildStoragePath(user.id, "logo", file.name);

  const { error: uploadError } = await supabase.storage
    .from("club-logos")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    redirectWithError("/app/club/parametres", uploadError.message);
  }

  if (club?.logo_path) {
    await supabase.storage.from("club-logos").remove([club.logo_path]);
  }

  const { error: updateError } = await supabase
    .from("clubs")
    .update({ logo_path: filePath })
    .eq("user_id", user.id);

  if (updateError) {
    redirectWithError("/app/club/parametres", updateError.message);
  }

  revalidatePath("/app/club/parametres");
  revalidatePath("/app/club/profil");
  revalidatePath("/app/club/feed");
  revalidatePath("/app/club/demandes");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/app/joueur/clubs/[id]");
  revalidatePath("/app/joueur/notifications");
  revalidatePath("/app/joueur/demandes");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/clubs");
  revalidatePath("/clubs/[id]");

  redirectWithMessage("/app/club/parametres", "Logo mis à jour");
}

export async function removeClubLogo() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("logo_path")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clubError) {
    redirectWithError("/app/club/parametres", clubError.message);
  }

  if (club?.logo_path) {
    await supabase.storage.from("club-logos").remove([club.logo_path]);
  }

  const { error } = await supabase
    .from("clubs")
    .update({ logo_path: null })
    .eq("user_id", user.id);

  if (error) {
    redirectWithError("/app/club/parametres", error.message);
  }

  revalidatePath("/app/club/parametres");
  revalidatePath("/app/club/profil");
  revalidatePath("/app/club/feed");
  revalidatePath("/app/club/demandes");
  revalidatePath("/app/joueur/clubs");
  revalidatePath("/app/joueur/clubs/[id]");
  revalidatePath("/app/joueur/notifications");
  revalidatePath("/app/joueur/demandes");
  revalidatePath("/app/joueur/opportunites");
  revalidatePath("/clubs");
  revalidatePath("/clubs/[id]");

  redirectWithMessage("/app/club/parametres", "Logo supprimé");
}

export async function uploadPlayerMedia(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const title = String(formData.get("title") || "").trim();
  const mediaType = String(formData.get("media_type") || "image").trim();
  const externalUrl = String(formData.get("external_url") || "").trim() || null;
  const file = formData.get("file");

  if (!["image", "video", "link"].includes(mediaType)) {
    redirectWithError("/app/joueur/parametres", "Type de média invalide");
  }

  const { data: profile, error: profileError } = await supabase
    .from("player_profiles")
    .select("id, subscription_tier")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirectWithError("/app/joueur/parametres", profileError?.message || "Profil introuvable");
  }

  const { count } = await supabase
    .from("player_media")
    .select("*", { count: "exact", head: true })
    .eq("owner_user_id", user.id);

  const currentCount = count ?? 0;
  const isFree = (profile.subscription_tier || "free") === "free";

  if (isFree && currentCount >= 3) {
    redirectWithError("/app/joueur/parametres", "Limite atteinte : 3 médias maximum sur ce plan");
  }

  const { data: maxSortRow } = await supabase
    .from("player_media")
    .select("sort_order")
    .eq("owner_user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (maxSortRow?.sort_order ?? -1) + 1;

  let storagePath: string | null = null;

  if (mediaType === "image") {
    if (!(file instanceof File) || file.size === 0) {
      redirectWithError("/app/joueur/parametres", "Choisis une image");
    }

    if (!isImage(file)) {
      redirectWithError("/app/joueur/parametres", "Le fichier doit être une image");
    }

    if (file.size > 8 * 1024 * 1024) {
      redirectWithError("/app/joueur/parametres", "Image trop lourde (max 8 Mo)");
    }

    storagePath = buildStoragePath(user.id, "media", file.name);

    const { error: uploadError } = await supabase.storage
      .from("player-media")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      redirectWithError("/app/joueur/parametres", uploadError.message);
    }
  } else {
    if (!externalUrl) {
      redirectWithError("/app/joueur/parametres", "Ajoute un lien pour ce type de média");
    }
  }

  const { error: insertError } = await supabase.from("player_media").insert({
    player_profile_id: profile.id,
    owner_user_id: user.id,
    media_type: mediaType,
    storage_path: storagePath,
    external_url: mediaType === "image" ? null : externalUrl,
    title: title || null,
    sort_order: nextSort,
  });

  if (insertError) {
    if (storagePath) {
      await supabase.storage.from("player-media").remove([storagePath]);
    }
    redirectWithError("/app/joueur/parametres", insertError.message);
  }

  revalidatePath("/app/joueur/parametres");
  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/club/joueurs/[id]");
  revalidatePath("/joueurs/[id]");

  redirectWithMessage("/app/joueur/parametres", "Média ajouté");
}

export async function deletePlayerMedia(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const mediaId = String(formData.get("media_id") || "").trim();

  if (!mediaId) {
    redirectWithError("/app/joueur/parametres", "Média introuvable");
  }

  const { data: media, error: mediaError } = await supabase
    .from("player_media")
    .select("id, storage_path, owner_user_id")
    .eq("id", mediaId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (mediaError || !media) {
    redirectWithError("/app/joueur/parametres", mediaError?.message || "Média introuvable");
  }

  if (media.storage_path) {
    await supabase.storage.from("player-media").remove([media.storage_path]);
  }

  const { error: deleteError } = await supabase
    .from("player_media")
    .delete()
    .eq("id", media.id)
    .eq("owner_user_id", user.id);

  if (deleteError) {
    redirectWithError("/app/joueur/parametres", deleteError.message);
  }

  revalidatePath("/app/joueur/parametres");
  revalidatePath("/app/joueur/profil");
  revalidatePath("/app/club/joueurs/[id]");
  revalidatePath("/joueurs/[id]");

  redirectWithMessage("/app/joueur/parametres", "Média supprimé");
}