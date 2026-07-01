"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteFromClient } from "@/app/favorite-actions";

type FavoriteButtonProps = {
  targetType: "club_offer" | "club" | "player_profile" | "post";
  targetId: string;
  initialSaved?: boolean;
  compact?: boolean;
};

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

export default function FavoriteButton({ targetType, targetId, initialSaved = false, compact = false }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    const previous = saved;
    setSaved(!previous);
    setError("");

    startTransition(async () => {
      const result = await toggleFavoriteFromClient({ target_type: targetType, target_id: targetId });

      if (!result.ok) {
        setSaved(previous);
        setError(result.error || "Impossible de modifier le favori.");
        return;
      }

      setSaved(Boolean(result.saved));
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "px-3 py-2" : "px-4 py-2.5",
          saved
            ? "border-red-400/25 bg-red-500/10 text-red-300"
            : "border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--text-soft)] hover:border-red-400/25 hover:text-red-300",
        ].join(" ")}
        aria-pressed={saved}
      >
        <HeartIcon filled={saved} />
        {compact ? (saved ? "Sauvé" : "Sauver") : saved ? "Enregistré" : "Sauvegarder"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </span>
  );
}
