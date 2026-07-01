type ClubLogoProps = {
  logoPath?: string | null;
  clubName?: string | null;
  size?: "sm" | "md" | "lg";
};

import { getPublicStorageUrl } from "@/lib/storage/public-url";

function getInitials(name?: string | null) {
  if (!name) return "C";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function ClubLogo({
  logoPath,
  clubName,
  size = "md",
}: ClubLogoProps) {
  const src = getPublicStorageUrl("club-logos", logoPath);

  const sizeClass =
    size === "sm"
      ? "h-10 w-10 text-xs"
      : size === "lg"
        ? "h-20 w-20 text-xl"
        : "h-14 w-14 text-sm";

  return src ? (
    <img
      src={src}
      alt={clubName || "Logo club"}
      className={`${sizeClass} shrink-0 rounded-[18px] border border-[#9b5cff]/25 bg-white/[0.03] object-cover shadow-[0_0_34px_rgba(155,92,255,0.14)]`}
    />
  ) : (
    <div
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-[18px] border border-[#9b5cff]/25 bg-gradient-to-br from-[#9b5cff]/22 to-[#4f8cff]/10 font-semibold text-white shadow-[0_0_34px_rgba(155,92,255,0.12)]`}
      aria-label={clubName || "Logo club"}
    >
      {getInitials(clubName)}
    </div>
  );
}
