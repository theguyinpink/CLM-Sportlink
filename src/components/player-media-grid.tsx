import { getPublicStorageUrl } from "@/lib/storage/public-url";

type PlayerMediaItem = {
  id: string;
  media_type?: "image" | "video" | "link" | null;
  storage_path?: string | null;
  external_url?: string | null;
  title?: string | null;
  sort_order?: number | null;
};

export default function PlayerMediaGrid({
  media,
}: {
  media: PlayerMediaItem[];
}) {
  if (!media || media.length === 0) return null;

  const ordered = [...media].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((item) => {
        const type = item.media_type || "image";
        const imageSrc =
          type === "image"
            ? getPublicStorageUrl("player-media", item.storage_path)
            : null;

        return (
          <article key={item.id} className="premium-card overflow-hidden rounded-[26px]">
            {type === "image" && imageSrc ? (
              <img
                src={imageSrc}
                alt={item.title || "Média joueur"}
                className="h-56 w-full object-cover"
              />
            ) : type === "video" ? (
              <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#4f8cff]/12 to-[#9b5cff]/10 px-4 text-center text-sm text-white/62">
                Vidéo ajoutée
              </div>
            ) : type === "link" ? (
              <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#00d4ff]/10 to-[#4f8cff]/10 px-4 text-center text-sm text-white/62">
                Lien externe
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center bg-white/[0.03] px-4 text-center text-sm text-white/55">
                Média indisponible
              </div>
            )}

            <div className="p-4">
              <p className="text-sm text-white">
                {item.title || "Sans titre"}
              </p>

              {type === "link" && item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-[#00d4ff]"
                >
                  Ouvrir le lien
                </a>
              )}

              {type === "video" && item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-[#8bb7ff]"
                >
                  Voir la vidéo
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
