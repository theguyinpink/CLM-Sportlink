"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import PlayerAvatar from "@/components/player-avatar";
import ClubLogo from "@/components/club-logo";
import { getPublicStorageUrl } from "@/lib/storage/public-url";
import {
  formatPostDate,
  getPostContentLabel,
  getPostContentTypesFor,
  type PostAuthorType,
} from "@/lib/posts";
import { deletePostFromClient, updatePostFromClient } from "@/app/post-actions";
import { SPORT_OPTIONS, REGION_OPTIONS, withCurrentOption } from "@/lib/form-options";

export type PostCardData = {
  id: string;
  author_user_id?: string | null;
  author_type: PostAuthorType;
  sport?: string | null;
  city?: string | null;
  region?: string | null;
  radius_km?: number | null;
  content_type?: string | null;
  title?: string | null;
  text_content?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  player_profiles?: {
    id: string;
    display_name?: string | null;
    avatar_path?: string | null;
    sport?: string | null;
    city?: string | null;
    region?: string | null;
  } | null;
  clubs?: {
    id: string;
    club_name?: string | null;
    logo_path?: string | null;
    sport?: string | null;
    city?: string | null;
    region?: string | null;
  } | null;
  post_media?: Array<{
    id: string;
    media_type: "image" | "video" | "link";
    storage_path?: string | null;
    external_url?: string | null;
    sort_order?: number | null;
  }> | null;
};

type PostCardProps = {
  post: PostCardData;
  currentUserId?: string | null;
  viewerRole: PostAuthorType;
  index?: number;
};

function getYoutubeEmbedUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname.startsWith("/watch")) {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isExternalVideo(url?: string | null) {
  if (!url) return false;
  return /youtube|youtu\.be|vimeo|dailymotion|tiktok/i.test(url);
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function DeleteConfirmModal({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-[#050612]/86 backdrop-blur-xl" onClick={onCancel} />

      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#0d1020] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,92,122,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(79,140,255,0.10),transparent_38%)]" />

        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#07080f]/90 text-white transition hover:bg-white/[0.06]"
          aria-label="Fermer"
        >
          <CloseIcon />
        </button>

        <div className="relative z-10 pr-12">
          <p className="text-[11px] uppercase tracking-[0.24em] text-red-300/70">
            Suppression
          </p>
          <h3 className="font-display mt-4 text-[2.4rem] uppercase leading-[0.9] text-white">
            Supprimer cette publication ?
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Cette action supprimera la publication du fil d’actualité. Si elle contient une image ou une vidéo hébergée, le média sera aussi supprimé.
          </p>
        </div>

        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full border border-red-500/25 bg-red-500/14 px-5 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Suppression..." : "Oui, supprimer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/72 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, currentUserId, viewerRole, index = 0 }: PostCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (deleteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteOpen]);

  const isOwner = Boolean(currentUserId && post.author_user_id === currentUserId);
  const authorType = post.author_type === "club" ? "club" : "player";
  const authorName =
    authorType === "club"
      ? post.clubs?.club_name || "Club"
      : post.player_profiles?.display_name || "Joueur";
  const authorHref =
    authorType === "club"
      ? post.clubs?.id
        ? viewerRole === "player"
          ? `/app/joueur/clubs/${post.clubs.id}`
          : `/clubs/${post.clubs.id}`
        : "/clubs"
      : post.player_profiles?.id
        ? viewerRole === "club"
          ? `/app/club/joueurs/${post.player_profiles.id}`
          : `/joueurs/${post.player_profiles.id}`
        : "/joueurs";

  const media = useMemo(
    () => [...(post.post_media || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [post.post_media],
  );

  async function confirmDelete() {
    setLoading(true);
    setError("");
    const result = await deletePostFromClient(post.id);

    if (!result.ok) {
      setError(result.error || "Impossible de supprimer la publication.");
      setLoading(false);
      setDeleteOpen(false);
      return;
    }

    setDeleteOpen(false);
    setLoading(false);
    router.refresh();
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const radiusRaw = String(formData.get("radius_km") || "").trim();

    const result = await updatePostFromClient({
      post_id: post.id,
      content_type: String(formData.get("content_type") || post.content_type || "post-libre"),
      title: String(formData.get("title") || "").trim(),
      text_content: String(formData.get("text_content") || "").trim(),
      sport: String(formData.get("sport") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      region: String(formData.get("region") || "").trim(),
      radius_km: radiusRaw ? Number(radiusRaw) : 50,
    });

    if (!result.ok) {
      setError(result.error || "Impossible de modifier la publication.");
      setLoading(false);
      return;
    }

    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <article
        className="premium-card animate-fade-up overflow-hidden rounded-[34px] p-5 transition hover:-translate-y-1 sm:p-6"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            {authorType === "club" ? (
              <ClubLogo logoPath={post.clubs?.logo_path} clubName={authorName} size="md" />
            ) : (
              <PlayerAvatar avatarPath={post.player_profiles?.avatar_path} displayName={authorName} size="md" />
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8bb7ff]">
                  {authorType === "club" ? "Club" : "Joueur"}
                </span>
                <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">
                  {getPostContentLabel(post.content_type)}
                </span>
              </div>

              <h3 className="font-display mt-4 text-[2.1rem] uppercase leading-[0.9] text-white sm:text-[2.55rem]">
                {post.title || authorName}
              </h3>

              <p className="mt-2 text-sm leading-7 text-white/58">
                {authorName} • {formatPostDate(post.created_at)}
                {post.sport ? ` • ${post.sport}` : ""}
                {post.city || post.region ? ` • ${post.city || post.region}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={authorHref}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition hover:border-[#4f8cff]/35 hover:bg-[#4f8cff]/10 hover:text-white"
            >
              Voir le profil
            </Link>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing((value) => !value)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/72 transition hover:bg-white/5 hover:text-white"
                >
                  {editing ? "Annuler" : "Modifier"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={loading}
                  className="rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate} className="mt-7 grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/55">Type</label>
                <select
                  name="content_type"
                  defaultValue={post.content_type || "post-libre"}
                  className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none"
                >
                  {getPostContentTypesFor(authorType).map((item) => (
                    <option key={item.value} value={item.value} className="bg-[#07080f] text-white">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Titre</label>
                <input
                  name="title"
                  defaultValue={post.title || ""}
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none"
                />
              </div>
            </div>

            <textarea
              name="text_content"
              defaultValue={post.text_content || ""}
              rows={5}
              required
              className="w-full rounded-[24px] border border-white/8 bg-white/2 px-5 py-4 text-white outline-none"
            />

            <div className="grid gap-4 sm:grid-cols-4">
              <select name="sport" defaultValue={post.sport || ""} className="rounded-full border border-white/10 bg-[#07080f] px-4 py-3 text-white outline-none">
                <option value="" className="bg-[#07080f] text-white/50">Sport</option>
                {withCurrentOption(SPORT_OPTIONS, post.sport).map((sport) => (
                  <option key={sport} value={sport} className="bg-[#07080f] text-white">{sport}</option>
                ))}
              </select>
              <input name="city" defaultValue={post.city || ""} placeholder="Ville" className="border-b border-white/10 bg-transparent py-3 text-white outline-none placeholder:text-white/30" />
              <select name="region" defaultValue={post.region || ""} className="rounded-full border border-white/10 bg-[#07080f] px-4 py-3 text-white outline-none">
                <option value="" className="bg-[#07080f] text-white/50">Région</option>
                {withCurrentOption(REGION_OPTIONS, post.region).map((region) => (
                  <option key={region} value={region} className="bg-[#07080f] text-white">{region}</option>
                ))}
              </select>
              <input name="radius_km" type="number" defaultValue={post.radius_km || 50} placeholder="Rayon" className="border-b border-white/10 bg-transparent py-3 text-white outline-none placeholder:text-white/30" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-fit rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        ) : (
          <p className="mt-7 whitespace-pre-line text-sm leading-8 text-white/68">
            {post.text_content}
          </p>
        )}

        {media.length > 0 && (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {media.map((item) => {
              const imageSrc = item.media_type === "image" ? getPublicStorageUrl("post-media", item.storage_path) : null;
              const videoSrc = item.media_type === "video" && item.storage_path ? getPublicStorageUrl("post-media", item.storage_path) : null;
              const youtubeEmbedUrl = item.media_type === "video" ? getYoutubeEmbedUrl(item.external_url) : null;

              if (item.media_type === "image" && imageSrc) {
                return (
                  <img
                    key={item.id}
                    src={imageSrc}
                    alt={post.title || "Image de publication"}
                    className="max-h-[420px] w-full rounded-[26px] border border-white/8 object-cover"
                  />
                );
              }

              if (item.media_type === "video" && videoSrc) {
                return (
                  <video
                    key={item.id}
                    controls
                    preload="metadata"
                    className="max-h-[460px] w-full rounded-[26px] border border-white/8 bg-black object-contain"
                  >
                    <source src={videoSrc} />
                    Ton navigateur ne peut pas lire cette vidéo.
                  </video>
                );
              }

              if (item.media_type === "video" && youtubeEmbedUrl) {
                return (
                  <div key={item.id} className="overflow-hidden rounded-[26px] border border-white/8 bg-black">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={post.title || "Vidéo YouTube"}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.external_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[26px] border border-white/8 bg-white/5 p-5 transition hover:border-[#4f8cff]/30 hover:bg-[#4f8cff]/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                    {isExternalVideo(item.external_url) ? "Vidéo" : "Lien externe"}
                  </p>
                  <p className="mt-3 break-all text-sm leading-7 text-[#8bb7ff]">
                    {item.external_url}
                  </p>
                </a>
              );
            })}
          </div>
        )}
      </article>

      {mounted && deleteOpen && createPortal(
        <DeleteConfirmModal
          loading={loading}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
        />,
        document.body,
      )}
    </>
  );
}
