import type { PostAuthorType } from "@/lib/posts";
import type { PostCardData } from "@/components/post-card";

type SupabaseLike = any;

type RawPost = Record<string, any>;

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function normalizeAuthorType(post: RawPost): PostAuthorType {
  const value = post.author_type || post.author_role;
  if (value === "club") return "club";
  return "player";
}

function getAuthorUserId(post: RawPost) {
  return post.author_user_id || post.user_id || null;
}

export async function getPublicPostsForFeed(supabase: SupabaseLike): Promise<PostCardData[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(90);

  if (error || !posts || posts.length === 0) {
    return [];
  }

  const postIds = unique(posts.map((post: RawPost) => post.id));
  const playerProfileIds = unique(posts.map((post: RawPost) => post.player_profile_id));
  const clubIds = unique(posts.map((post: RawPost) => post.club_id));
  const authorUserIds = unique(posts.map((post: RawPost) => getAuthorUserId(post)));

  const [mediaResult, playersByIdResult, playersByUserResult, clubsByIdResult, clubsByUserResult] = await Promise.all([
    postIds.length
      ? supabase
          .from("post_media")
          .select("id, post_id, media_type, storage_path, external_url, sort_order")
          .in("post_id", postIds)
      : Promise.resolve({ data: [] }),

    playerProfileIds.length
      ? supabase
          .from("player_profiles")
          .select("id, user_id, display_name, avatar_path, sport, city, region")
          .in("id", playerProfileIds)
      : Promise.resolve({ data: [] }),

    authorUserIds.length
      ? supabase
          .from("player_profiles")
          .select("id, user_id, display_name, avatar_path, sport, city, region")
          .in("user_id", authorUserIds)
      : Promise.resolve({ data: [] }),

    clubIds.length
      ? supabase
          .from("clubs")
          .select("id, user_id, club_name, logo_path, sport, city, region")
          .in("id", clubIds)
      : Promise.resolve({ data: [] }),

    authorUserIds.length
      ? supabase
          .from("clubs")
          .select("id, user_id, club_name, logo_path, sport, city, region")
          .in("user_id", authorUserIds)
      : Promise.resolve({ data: [] }),
  ]);

  const mediaByPostId = new Map<string, any[]>();
  for (const media of mediaResult.data || []) {
    const list = mediaByPostId.get(media.post_id) || [];
    list.push(media);
    mediaByPostId.set(media.post_id, list);
  }

  const playersById = new Map<string, any>();
  const playersByUserId = new Map<string, any>();
  for (const player of [...(playersByIdResult.data || []), ...(playersByUserResult.data || [])]) {
    if (player.id) playersById.set(player.id, player);
    if (player.user_id) playersByUserId.set(player.user_id, player);
  }

  const clubsById = new Map<string, any>();
  const clubsByUserId = new Map<string, any>();
  for (const club of [...(clubsByIdResult.data || []), ...(clubsByUserResult.data || [])]) {
    if (club.id) clubsById.set(club.id, club);
    if (club.user_id) clubsByUserId.set(club.user_id, club);
  }

  return posts.map((post: RawPost) => {
    const authorType = normalizeAuthorType(post);
    const authorUserId = getAuthorUserId(post);
    const player =
      authorType === "player"
        ? playersById.get(post.player_profile_id) || playersByUserId.get(authorUserId)
        : null;
    const club =
      authorType === "club"
        ? clubsById.get(post.club_id) || clubsByUserId.get(authorUserId)
        : null;

    return {
      ...post,
      author_user_id: authorUserId,
      author_type: authorType,
      player_profiles: player || null,
      clubs: club || null,
      post_media: (mediaByPostId.get(post.id) || []).sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    } as PostCardData;
  });
}
