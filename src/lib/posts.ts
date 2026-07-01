export type PostAuthorType = "player" | "club";
export type PostMediaType = "image" | "video" | "link";

export type PostContentOption = {
  value: string;
  label: string;
  authorTypes: PostAuthorType[];
};

export const POST_CONTENT_TYPES: PostContentOption[] = [
  { value: "disponibilite", label: "Disponibilité", authorTypes: ["player"] },
  { value: "highlight", label: "Highlight / vidéo", authorTypes: ["player"] },
  { value: "recherche-club", label: "Recherche de club", authorTypes: ["player"] },
  { value: "progression", label: "Progression", authorTypes: ["player"] },
  { value: "actualite-joueur", label: "Actualité joueur", authorTypes: ["player"] },
  { value: "actualite-club", label: "Actualité club", authorTypes: ["club"] },
  { value: "recherche-joueur", label: "Recherche joueur", authorTypes: ["club"] },
  { value: "detection", label: "Détection", authorTypes: ["club"] },
  { value: "evenement", label: "Événement", authorTypes: ["club"] },
  { value: "resultat", label: "Résultat", authorTypes: ["club"] },
  { value: "post-libre", label: "Post libre", authorTypes: ["player", "club"] },
];

export function getPostContentLabel(value?: string | null) {
  if (!value) return "Post";
  return POST_CONTENT_TYPES.find((item) => item.value === value)?.label || value;
}

export function getPostContentTypesFor(authorType: PostAuthorType) {
  return POST_CONTENT_TYPES.filter((item) => item.authorTypes.includes(authorType));
}

export function formatPostDate(value?: string | null) {
  if (!value) return "Date inconnue";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Date inconnue";
  }
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesOrEquals(a?: string | null, b?: string | null) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

export function calculatePostRelevance(
  viewer: {
    sport?: string | null;
    city?: string | null;
    region?: string | null;
    bio?: string | null;
    description?: string | null;
  },
  post: {
    sport?: string | null;
    city?: string | null;
    region?: string | null;
    text_content?: string | null;
    title?: string | null;
  },
) {
  let score = 0;

  if (includesOrEquals(viewer.sport, post.sport)) score += 40;
  if (includesOrEquals(viewer.region, post.region)) score += 25;
  if (includesOrEquals(viewer.city, post.city)) score += 20;

  const viewerText = normalize(`${viewer.bio || ""} ${viewer.description || ""}`);
  const postText = normalize(`${post.title || ""} ${post.text_content || ""}`);

  if (viewerText && postText) {
    const words = viewerText
      .split(" ")
      .filter((word) => word.length >= 5)
      .slice(0, 40);
    const common = words.filter((word) => postText.includes(word));
    score += Math.min(15, common.length * 3);
  }

  return score;
}
