"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPostFromClient } from "@/app/post-actions";
import FileInput from "@/components/file-input";
import { getPostContentTypesFor, type PostAuthorType, type PostMediaType } from "@/lib/posts";
import { SPORT_OPTIONS, REGION_OPTIONS } from "@/lib/form-options";

type PostComposerProps = {
  authorType: PostAuthorType;
  authorLabel: string;
  defaultSport?: string | null;
  defaultCity?: string | null;
  defaultRegion?: string | null;
  mode?: "page" | "modal";
  onSuccess?: () => void;
  onCancel?: () => void;
};

function OptionList({ id, values }: { id: string; values: string[] }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
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

function getFileKind(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "unknown";
}

async function uploadPostFile(file: File, expectedType: "image" | "video") {
  if (!file || file.size === 0) return null;

  const detectedType = getFileKind(file);
  if (detectedType !== expectedType) {
    throw new Error(expectedType === "image" ? "Le fichier doit être une image." : "Le fichier doit être une vidéo.");
  }

  const maxImageSize = 8 * 1024 * 1024;
  const maxVideoSize = 90 * 1024 * 1024;

  if (expectedType === "image" && file.size > maxImageSize) {
    throw new Error("Image trop lourde : 8 Mo maximum.");
  }

  if (expectedType === "video" && file.size > maxVideoSize) {
    throw new Error("Vidéo trop lourde : 90 Mo maximum.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Tu dois être connecté.");

  const safeName = sanitizeFilename(file.name) || expectedType;
  const path = `${user.id}/post-${expectedType}-${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("post-media")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);
  return path;
}

export default function PostComposer({
  authorType,
  authorLabel,
  defaultSport,
  defaultCity,
  defaultRegion,
  mode = "page",
  onSuccess,
  onCancel,
}: PostComposerProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState<PostMediaType>("image");

  const contentTypes = useMemo(() => getPostContentTypesFor(authorType), [authorType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const imageFile = formData.get("image_file");
      const videoFile = formData.get("video_file");
      const externalUrl = String(formData.get("external_url") || "").trim();
      const mediaItems: Array<{
        media_type: PostMediaType;
        storage_path?: string | null;
        external_url?: string | null;
      }> = [];

      if (mediaType === "image" && imageFile instanceof File && imageFile.size > 0) {
        const storagePath = await uploadPostFile(imageFile, "image");
        if (storagePath) {
          mediaItems.push({ media_type: "image", storage_path: storagePath });
        }
      }

      if (mediaType === "video") {
        if (videoFile instanceof File && videoFile.size > 0) {
          const storagePath = await uploadPostFile(videoFile, "video");
          if (storagePath) {
            mediaItems.push({ media_type: "video", storage_path: storagePath });
          }
        } else if (externalUrl) {
          mediaItems.push({ media_type: "video", external_url: externalUrl });
        }
      }

      if (mediaType === "link" && externalUrl) {
        mediaItems.push({ media_type: "link", external_url: externalUrl });
      }

      const radiusRaw = String(formData.get("radius_km") || "").trim();
      const result = await createPostFromClient({
        author_type: authorType,
        content_type: String(formData.get("content_type") || "post-libre"),
        title: String(formData.get("title") || "").trim(),
        text_content: String(formData.get("text_content") || "").trim(),
        sport: String(formData.get("sport") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        region: String(formData.get("region") || "").trim(),
        radius_km: radiusRaw ? Number(radiusRaw) : 50,
        media: mediaItems,
      });

      if (!result.ok) {
        setError(result.error || "Impossible de publier.");
        setLoading(false);
        return;
      }

      form.reset();
      setMediaType("image");
      setSuccess("Publication envoyée.");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const isModal = mode === "modal";

  return (
    <section
      className={
        isModal
          ? "relative max-h-[76vh] overflow-y-auto rounded-[26px] border border-white/8 bg-[#111527]/96 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
          : "premium-card rounded-[34px] p-5 sm:p-6"
      }
    >
      <OptionList id="post-sports" values={SPORT_OPTIONS} />
      <OptionList id="post-regions" values={REGION_OPTIONS} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Nouvelle publication
          </p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.9] text-white">
            {isModal ? "Créer une actualité" : "Partager une actualité"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Tu publies en tant que <span className="text-white">{authorLabel}</span>.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/55">Type de publication</label>
              <select
                name="content_type"
                className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none"
                defaultValue={contentTypes[0]?.value || "post-libre"}
              >
                {contentTypes.map((item) => (
                  <option key={item.value} value={item.value} className="bg-[#07080f] text-white">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/55">Titre optionnel</label>
              <input
                name="title"
                placeholder={authorType === "player" ? "Ex : Nouvelle vidéo highlight" : "Ex : Détection samedi"}
                className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/55">Sport</label>
                <input
                  name="sport"
                  list="post-sports"
                  defaultValue={defaultSport || ""}
                  placeholder="Basketball"
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Rayon</label>
                <input
                  name="radius_km"
                  type="number"
                  min="0"
                  max="500"
                  defaultValue={50}
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/55">Ville</label>
                <input
                  name="city"
                  defaultValue={defaultCity || ""}
                  placeholder="Combs-la-Ville"
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/55">Région</label>
                <input
                  name="region"
                  list="post-regions"
                  defaultValue={defaultRegion || ""}
                  placeholder="Île-de-France"
                  className="w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/55">Texte</label>
              <textarea
                name="text_content"
                required
                rows={7}
                placeholder={
                  authorType === "player"
                    ? "Partage une disponibilité, une vidéo, une recherche de club, une progression..."
                    : "Partage une actualité, une détection, un besoin, un résultat ou un événement du club..."
                }
                className="w-full rounded-[26px] border border-white/8 bg-white/2 px-5 py-5 text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[0.55fr_1.45fr]">
              <div>
                <label className="mb-2 block text-sm text-white/55">Média</label>
                <select
                  value={mediaType}
                  onChange={(event) => setMediaType(event.target.value as PostMediaType)}
                  className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none"
                >
                  <option value="image" className="bg-[#07080f] text-white">Image</option>
                  <option value="video" className="bg-[#07080f] text-white">Vidéo</option>
                  <option value="link" className="bg-[#07080f] text-white">Lien</option>
                </select>
              </div>

              {mediaType === "image" ? (
                <div>
                  <label className="mb-2 block text-sm text-white/55">Image optionnelle</label>
                  <FileInput
                    name="image_file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    label="Choisir une image"
                    helper="Le nom du fichier s’affichera ici après sélection"
                  />
                </div>
              ) : mediaType === "video" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm text-white/55">Vidéo fichier optionnelle</label>
                    <FileInput
                      name="video_file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      label="Choisir une vidéo"
                      helper="MP4, WebM ou MOV recommandé"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/55">Ou lien YouTube</label>
                    <input
                      name="external_url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                  <p className="text-xs leading-5 text-white/38">
                    Si tu ajoutes un fichier vidéo, il sera lu directement dans le site. Sinon, colle un lien YouTube.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm text-white/55">Lien externe</label>
                  <input
                    name="external_url"
                    type="url"
                    placeholder="https://..."
                    className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-fit rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-6 py-3 text-sm font-bold text-[#050612] shadow-[0_14px_45px_rgba(79,140,255,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Publication..." : "Publier"}
          </button>

          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/68 transition hover:bg-white/[0.05] hover:text-white"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
