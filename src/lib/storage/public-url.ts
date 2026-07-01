export function getPublicStorageUrl(
  bucket: "avatars" | "club-logos" | "player-media" | "post-media",
  path?: string | null
) {
  if (!path) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/storage/v1/object/public/${bucket}/${cleanPath}`;
}