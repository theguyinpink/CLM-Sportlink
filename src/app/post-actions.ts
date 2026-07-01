"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PostAuthorType, PostMediaType } from "@/lib/posts";

type ActionResult = {
  ok: boolean;
  error?: string;
};

type PostMediaInput = {
  media_type: PostMediaType;
  storage_path?: string | null;
  external_url?: string | null;
};

type CreatePostInput = {
  author_type: PostAuthorType;
  content_type: string;
  title?: string | null;
  text_content: string;
  sport?: string | null;
  city?: string | null;
  region?: string | null;
  radius_km?: number | null;
  media?: PostMediaInput[];
};

type UpdatePostInput = {
  post_id: string;
  content_type: string;
  title?: string | null;
  text_content: string;
  sport?: string | null;
  city?: string | null;
  region?: string | null;
  radius_km?: number | null;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function sanitizeRadius(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(500, Math.round(value)));
}

function revalidatePostSurfaces() {
  revalidatePath("/app/joueur/fil");
  revalidatePath("/app/club/fil");
  revalidatePath("/app/joueur/feed");
  revalidatePath("/app/club/feed");
}

async function resolveAuthor(authorType: PostAuthorType) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null, club: null, error: "Tu dois être connecté." };
  }

  if (authorType === "player") {
    const { data: profile, error } = await supabase
      .from("player_profiles")
      .select("id, sport, city, region")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return { supabase, user, profile: null, club: null, error: error.message };
    if (!profile) return { supabase, user, profile: null, club: null, error: "Crée d'abord ton profil joueur." };

    return { supabase, user, profile, club: null, error: null };
  }

  const { data: club, error } = await supabase
    .from("clubs")
    .select("id, sport, city, region")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { supabase, user, profile: null, club: null, error: error.message };
  if (!club) return { supabase, user, profile: null, club: null, error: "Crée d'abord ta fiche club." };

  return { supabase, user, profile: null, club, error: null };
}

export async function createPostFromClient(input: CreatePostInput): Promise<ActionResult> {
  const authorType = input.author_type === "club" ? "club" : "player";
  const resolved = await resolveAuthor(authorType);
  const { supabase, user, profile, club, error: authorError } = resolved;

  if (authorError || !user) return { ok: false, error: authorError || "Connexion requise." };

  const textContent = clean(input.text_content);
  const title = clean(input.title) || null;
  const contentType = clean(input.content_type) || "post-libre";
  const media = (input.media || []).filter((item) => {
    if (item.media_type === "image") return Boolean(item.storage_path);
    if (item.media_type === "video") return Boolean(item.storage_path || item.external_url);
    return Boolean(item.external_url);
  });

  if (!textContent) {
    return { ok: false, error: "Le texte de la publication est obligatoire." };
  }

  const source = authorType === "player" ? profile : club;

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_user_id: user.id,
      author_type: authorType,
      player_profile_id: authorType === "player" ? profile?.id : null,
      club_id: authorType === "club" ? club?.id : null,
      sport: clean(input.sport) || source?.sport || null,
      city: clean(input.city) || source?.city || null,
      region: clean(input.region) || source?.region || null,
      radius_km: sanitizeRadius(input.radius_km),
      content_type: contentType,
      title,
      text_content: textContent,
      visibility: "public",
    })
    .select("id")
    .single();

  if (error || !post) {
    return { ok: false, error: error?.message || "Impossible de créer la publication." };
  }

  if (media.length > 0) {
    const { error: mediaError } = await supabase.from("post_media").insert(
      media.slice(0, 4).map((item, index) => ({
        post_id: post.id,
        owner_user_id: user.id,
        media_type: item.media_type,
        storage_path: item.media_type === "image" || item.media_type === "video" ? item.storage_path || null : null,
        external_url: item.media_type === "image" ? null : item.external_url || null,
        sort_order: index,
      })),
    );

    if (mediaError) {
      await supabase.from("posts").delete().eq("id", post.id).eq("author_user_id", user.id);
      return { ok: false, error: mediaError.message };
    }
  }

  revalidatePostSurfaces();
  return { ok: true };
}

export async function updatePostFromClient(input: UpdatePostInput): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const postId = clean(input.post_id);
  const textContent = clean(input.text_content);

  if (!postId) return { ok: false, error: "Publication introuvable." };
  if (!textContent) return { ok: false, error: "Le texte de la publication est obligatoire." };

  const { error } = await supabase
    .from("posts")
    .update({
      content_type: clean(input.content_type) || "post-libre",
      title: clean(input.title) || null,
      text_content: textContent,
      sport: clean(input.sport) || null,
      city: clean(input.city) || null,
      region: clean(input.region) || null,
      radius_km: sanitizeRadius(input.radius_km),
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("author_user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePostSurfaces();
  return { ok: true };
}

export async function deletePostFromClient(postId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const id = clean(postId);
  if (!id) return { ok: false, error: "Publication introuvable." };

  const { data: media } = await supabase
    .from("post_media")
    .select("storage_path")
    .eq("post_id", id)
    .eq("owner_user_id", user.id);

  const paths = (media || [])
    .map((item) => item.storage_path)
    .filter(Boolean) as string[];

  if (paths.length > 0) {
    await supabase.storage.from("post-media").remove(paths);
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePostSurfaces();
  return { ok: true };
}
