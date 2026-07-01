import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { acceptRequest, refuseRequest } from "@/app/connection-actions";
import ClubLogo from "@/components/club-logo";
import PlayerAvatar from "@/components/player-avatar";
import EmptyState from "@/components/empty-state";
import { formatPostDate } from "@/lib/posts";

function statusLabel(status?: string | null) {
  if (status === "accepted") return "Acceptée";
  if (status === "refused") return "Refusée";
  return "En attente";
}

function statusClass(status?: string | null) {
  if (status === "accepted") return "status-accepted";
  if (status === "refused") return "status-danger";
  return "status-pending";
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

async function getActors(supabase: any, userIds: string[]) {
  const [playersResult, clubsResult] = await Promise.all([
    userIds.length ? supabase.from("player_profiles").select("user_id, display_name, avatar_path").in("user_id", userIds) : Promise.resolve({ data: [] }),
    userIds.length ? supabase.from("clubs").select("user_id, club_name, logo_path").in("user_id", userIds) : Promise.resolve({ data: [] }),
  ]);

  const players = new Map<string, any>((playersResult.data || []).map((item: any) => [item.user_id, item]));
  const clubs = new Map<string, any>((clubsResult.data || []).map((item: any) => [item.user_id, item]));
  return { players, clubs };
}

function getActor(userId: string, actors: { players: Map<string, any>; clubs: Map<string, any> }) {
  const club = actors.clubs.get(userId);
  if (club) return { type: "club" as const, name: club.club_name || "Club", image: club.logo_path };
  const player = actors.players.get(userId);
  return { type: "player" as const, name: player?.display_name || "Profil sportif", image: player?.avatar_path };
}

export default async function PlayerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message = params.message;
  const error = params.error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  const [{ data: requests }, { data: ownPosts }] = await Promise.all([
    supabase
      .from("connection_requests")
      .select("*, clubs(id, club_name, sport, city, level, logo_path)")
      .eq("player_profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("id, title")
      .or(`player_profile_id.eq.${profile.id},author_user_id.eq.${user.id},user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  const postIds = unique((ownPosts || []).map((post: any) => post.id));
  const postsById = new Map((ownPosts || []).map((post: any) => [post.id, post]));

  const [likesResult, commentsResult] = await Promise.all([
    postIds.length
      ? supabase
          .from("post_likes")
          .select("id, post_id, user_id, created_at")
          .in("post_id", postIds)
          .neq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase
          .from("post_comments")
          .select("id, post_id, author_user_id, author_type, text_content, created_at")
          .in("post_id", postIds)
          .neq("author_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  const actorIds = unique([
    ...(likesResult.data || []).map((like: any) => like.user_id),
    ...(commentsResult.data || []).map((comment: any) => comment.author_user_id),
  ]);
  const actors = await getActors(supabase, actorIds);
  const activity = [
    ...(likesResult.data || []).map((like: any) => ({ type: "like", created_at: like.created_at, post: postsById.get(like.post_id), actor: getActor(like.user_id, actors) })),
    ...(commentsResult.data || []).map((comment: any) => ({ type: "comment", created_at: comment.created_at, post: postsById.get(comment.post_id), actor: getActor(comment.author_user_id, actors), text: comment.text_content })),
  ].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10);

  return (
    <main className="space-y-10">
      <section className="premium-card rounded-[28px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Notifications</p>
        <h1 className="font-display mt-2 text-[2.4rem] leading-tight text-[color:var(--text-main)]">Activité & demandes</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Suis les demandes reçues, les likes et les commentaires sur tes publications.
        </p>
      </section>

      {message && <div className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-5 py-3 text-sm text-[color:var(--primary)]">{message}</div>}
      {error && <div className="rounded-[18px] border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div>}

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Réactions</p>
          <h2 className="font-display mt-2 text-[1.9rem] text-[color:var(--text-main)]">Activité récente</h2>
        </div>

        {activity.length === 0 ? (
          <div className="premium-card rounded-[24px] p-6 text-sm text-[color:var(--text-muted)]">Aucun like ou commentaire pour le moment.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {activity.map((item: any, index: number) => (
              <article key={`${item.type}-${index}-${item.created_at}`} className="premium-card rounded-[24px] p-5">
                <div className="flex items-start gap-4">
                  {item.actor.type === "club" ? <ClubLogo logoPath={item.actor.image} clubName={item.actor.name} size="sm" /> : <PlayerAvatar avatarPath={item.actor.image} displayName={item.actor.name} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-7 text-[color:var(--text-soft)]">
                      <span className="font-semibold text-[color:var(--text-main)]">{item.actor.name}</span>{" "}
                      {item.type === "like" ? "a aimé ta publication" : "a commenté ta publication"}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.post?.title || "Publication"} • {formatPostDate(item.created_at)}</p>
                    {item.text && <p className="mt-3 line-clamp-2 text-sm leading-7 text-[color:var(--text-muted)]">{item.text}</p>}
                    <Link href="/app/joueur/fil" className="mt-3 inline-flex text-sm font-medium text-[color:var(--primary)]">Voir le fil</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Demandes</p>
          <h2 className="font-display mt-2 text-[1.9rem] text-[color:var(--text-main)]">Demandes reçues</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {!requests || requests.length === 0 ? (
            <EmptyState eyebrow="Aucune demande" title="Rien à traiter" description="Quand une nouvelle demande arrivera, elle apparaîtra ici avec ses actions." ctaHref="/app/joueur/feed" ctaLabel="Retour à l’accueil" />
          ) : (
            requests.map((request: any, index: number) => {
              const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;
              const clubHref = club?.id ? `/app/joueur/clubs/${club.id}` : "/app/joueur/clubs";

              return (
                <article key={request.id} className="premium-card animate-fade-up rounded-[26px] p-5" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <ClubLogo logoPath={club?.logo_path} clubName={club?.club_name || "Club"} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`ui-pill rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClass(request.status)}`}>{statusLabel(request.status)}</span>
                        <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">Club</span>
                      </div>
                      <Link href={clubHref} className="group mt-4 inline-flex"><h3 className="text-xl font-semibold text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">{club?.club_name || "Un club"}</h3></Link>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{club?.sport || "Sport"}{club?.city ? ` • ${club.city}` : ""}{club?.level ? ` • ${club.level}` : ""}</p>

                      {request.status === "pending" && (
                        <div className="mt-5 flex flex-wrap gap-3">
                          <form action={acceptRequest}><input type="hidden" name="request_id" value={request.id} /><button className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Accepter</button></form>
                          <form action={refuseRequest}><input type="hidden" name="request_id" value={request.id} /><button className="btn-secondary rounded-full px-5 py-3 text-sm font-medium">Refuser</button></form>
                          <Link href={clubHref} className="btn-secondary rounded-full px-5 py-3 text-sm font-medium">Voir le club</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
