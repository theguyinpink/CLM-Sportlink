type PlayerAvatarProps = {
  avatarPath?: string | null;
  displayName?: string | null;
  size?: "sm" | "md" | "lg";
};

import { getPublicStorageUrl } from "@/lib/storage/public-url";

function getInitials(name?: string | null) {
  if (!name) return "P";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function PlayerAvatar({
  avatarPath,
  displayName,
  size = "md",
}: PlayerAvatarProps) {
  const src = getPublicStorageUrl("avatars", avatarPath);

  const sizeClass =
    size === "sm"
      ? "h-10 w-10 text-xs"
      : size === "lg"
        ? "h-20 w-20 text-xl"
        : "h-14 w-14 text-sm";

  return src ? (
    <img
      src={src}
      alt={displayName || "Avatar joueur"}
      className={`${sizeClass} shrink-0 rounded-full border border-[#4f8cff]/25 bg-white/[0.03] object-cover shadow-[0_0_34px_rgba(79,140,255,0.14)]`}
    />
  ) : (
    <div
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full border border-[#4f8cff]/25 bg-gradient-to-br from-[#4f8cff]/22 to-[#00d4ff]/10 font-semibold text-white shadow-[0_0_34px_rgba(79,140,255,0.12)]`}
      aria-label={displayName || "Avatar joueur"}
    >
      {getInitials(displayName)}
    </div>
  );
}
