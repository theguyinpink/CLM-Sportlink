import { getSupabaseUrl } from "@/lib/supabase/config";

export function getPublicStorageUrl(
  bucket: "avatars" | "club-logos" | "player-media" | "post-media",
  path?: string | null
) {
  if (!path) return null;

  const cleanPath = path.replace(/^\/+/, "");

  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${cleanPath}`;
}