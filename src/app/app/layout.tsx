import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppSidebar from "@/components/app-sidebar";
import { isAdminEmail } from "@/lib/admin";

export default async function ConnectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const role = user.user_metadata?.role as "player" | "club" | undefined;
  const userId = user.id;

  if (!role || (role !== "player" && role !== "club")) {
    redirect("/connexion");
  }

  let notificationCount = 0;
  let identityLabel = "";
  const isAdmin = isAdminEmail(user.email);
  const reactionSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  if (role === "player") {
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("id, display_name")
      .eq("user_id", userId)
      .maybeSingle();

    identityLabel = profile?.display_name || "Profil joueur";

    if (profile) {
      const { count } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("player_profile_id", profile.id)
        .eq("status", "pending")
        .eq("source_role", "club");

      notificationCount = count ?? 0;

      const { data: ownPosts } = await supabase
        .from("posts")
        .select("id")
        .or(`player_profile_id.eq.${profile.id},author_user_id.eq.${userId},user_id.eq.${userId}`)
        .limit(80);

      const postIds = (ownPosts || []).map((post: any) => post.id).filter(Boolean);
      if (postIds.length > 0) {
        const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
          supabase
            .from("post_likes")
            .select("id", { count: "exact", head: true })
            .in("post_id", postIds)
            .neq("user_id", userId)
            .gte("created_at", reactionSince),
          supabase
            .from("post_comments")
            .select("id", { count: "exact", head: true })
            .in("post_id", postIds)
            .neq("author_user_id", userId)
            .gte("created_at", reactionSince),
        ]);
        notificationCount += (likeCount ?? 0) + (commentCount ?? 0);
      }
    }
  }

  if (role === "club") {
    const { data: club } = await supabase
      .from("clubs")
      .select("id, club_name")
      .eq("user_id", userId)
      .maybeSingle();

    identityLabel = club?.club_name || "Profil club";

    if (club) {
      const { count } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("club_id", club.id)
        .eq("status", "pending")
        .eq("source_role", "player");

      notificationCount = count ?? 0;

      const { data: ownPosts } = await supabase
        .from("posts")
        .select("id")
        .or(`club_id.eq.${club.id},author_user_id.eq.${userId},user_id.eq.${userId}`)
        .limit(80);

      const postIds = (ownPosts || []).map((post: any) => post.id).filter(Boolean);
      if (postIds.length > 0) {
        const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
          supabase
            .from("post_likes")
            .select("id", { count: "exact", head: true })
            .in("post_id", postIds)
            .neq("user_id", userId)
            .gte("created_at", reactionSince),
          supabase
            .from("post_comments")
            .select("id", { count: "exact", head: true })
            .in("post_id", postIds)
            .neq("author_user_id", userId)
            .gte("created_at", reactionSince),
        ]);
        notificationCount += (likeCount ?? 0) + (commentCount ?? 0);
      }
    }
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
      <div className="grid w-full gap-7 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar
          role={role}
          notificationCount={notificationCount}
          identityLabel={identityLabel}
          isAdmin={isAdmin}
        />

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}