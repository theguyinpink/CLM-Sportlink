import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerAvatar from "@/components/player-avatar";
import PlayerMediaGrid from "@/components/player-media-grid";
import ContactCounterModal from "@/components/contact-counter-modal";
import PostCard from "@/components/post-card";
import { calculatePlayerCompletion, getOfferTypeLabel } from "@/lib/matching";
import { getPublicPostsByPlayerProfile } from "@/lib/post-feed";

export default async function PlayerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/app/joueur/profil/edit");

  const [{ data: media }, { data: acceptedRequests }, profilePosts] = await Promise.all([
    supabase
      .from("player_media")
      .select("*")
      .eq("player_profile_id", profile.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("connection_requests")
      .select("*, clubs(id, club_name, sport, city, region, level, logo_path)")
      .eq("player_profile_id", profile.id)
      .eq("status", "accepted")
      .order("responded_at", { ascending: false }),
    getPublicPostsByPlayerProfile(supabase, profile.id, profile.user_id, 8),
  ]);

  const contacts = (acceptedRequests || [])
    .map((request: any) => {
      const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;
      if (!club?.id) return null;
      return {
        id: club.id,
        name: club.club_name || "Club",
        subtitle: [club.sport, club.city || club.region, club.level].filter(Boolean).join(" • "),
        imagePath: club.logo_path,
        href: `/app/joueur/clubs/${club.id}`,
        type: "club" as const,
      };
    })
    .filter(Boolean);

  const completion = calculatePlayerCompletion(profile);
  const missing = completion.checks.filter((check) => !check.done).slice(0, 4);
  const roles = Array.isArray(profile.roles_available)
    ? profile.roles_available
    : String(profile.roles_available || "player")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const isPlayer = roles.includes("player");
  const hasReferee = roles.includes("referee");
  const hasStaff = roles.includes("staff");

  const subtitle = [
    profile.sport,
    isPlayer ? profile.position : null,
    isPlayer ? profile.level : null,
    profile.city || profile.region,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <main className="profile-shell">
      <section className="profile-hero-grid">
        <div className="premium-card rounded-[28px] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-5">
              <PlayerAvatar avatarPath={profile.avatar_path} displayName={profile.display_name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Profil sportif</p>
                  {completion.score === 100 && <span className="ui-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Profil complété</span>}
                  <span className="ui-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Actif récemment</span>
                </div>
                <h1 className="font-display mt-3 text-[2.7rem] leading-[0.98] text-[color:var(--text-main)] sm:text-[3.6rem]">
                  {profile.display_name}
                </h1>
                {subtitle && <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">{subtitle}</p>}

                <div className="profile-stats mt-5">
                  {isPlayer && (
                    <>
                      <div className="profile-stat">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Poste</p>
                        <p className="mt-2 font-medium text-[color:var(--text-main)]">{profile.position || "À compléter"}</p>
                      </div>
                      <div className="profile-stat">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Niveau</p>
                        <p className="mt-2 font-medium text-[color:var(--text-main)]">{profile.level || "À compléter"}</p>
                      </div>
                    </>
                  )}
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Zone</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{profile.city || profile.region || "À compléter"}</p>
                  </div>
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Rôle</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{roles.map((role: string) => getOfferTypeLabel(role)).join(" • ")}</p>
                  </div>
                  <ContactCounterModal label="Contacts" contacts={contacts as any} variant="stat" />
                </div>
              </div>
            </div>

            <Link href="/app/joueur/profil/edit" className="btn-secondary rounded-full px-5 py-3 text-sm font-medium">
              Modifier
            </Link>
          </div>

          {profile.bio && (
            <div className="mt-7 border-t border-[color:var(--line)] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Bio</p>
              <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-8 text-[color:var(--text-soft)]">{profile.bio}</p>
            </div>
          )}
        </div>

        {completion.score < 100 && (
          <aside className="compact-completion">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Profil complété</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text-main)]">{completion.score}%</p>
              </div>
              <Link href="/app/joueur/profil/edit" className="rounded-full border border-[color:var(--line)] px-3 py-2 text-xs font-medium text-[color:var(--primary)]">
                Compléter
              </Link>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
              <div className="h-full rounded-full bg-[color:var(--primary)]" style={{ width: `${Math.max(8, Math.min(100, completion.score))}%` }} />
            </div>
            {missing.length > 0 && (
              <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">
                À compléter : {missing.map((item) => item.label).join(", ")}.
              </p>
            )}
          </aside>
        )}
      </section>

      {(hasReferee || hasStaff) && (
        <section className="grid gap-4 xl:grid-cols-2">
          {hasReferee && (
            <div className="premium-card rounded-[24px] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Disponibilités arbitre</p>
              <p className="mt-4 text-sm leading-8 text-[color:var(--text-soft)]">
                {profile.referee_sports || profile.sport || "Sport non renseigné"}
                {profile.referee_level ? ` • ${profile.referee_level}` : ""}
                {profile.referee_city ? ` • ${profile.referee_city}` : ""}
                {profile.referee_radius_km ? ` • ${profile.referee_radius_km} km` : ""}
              </p>
              {(profile.referee_availability || profile.referee_experience) && (
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[color:var(--text-muted)]">
                  {[profile.referee_availability, profile.referee_experience].filter(Boolean).join("\n")}
                </p>
              )}
            </div>
          )}

          {hasStaff && (
            <div className="premium-card rounded-[24px] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Coach / staff</p>
              <p className="mt-4 text-sm leading-8 text-[color:var(--text-soft)]">{profile.staff_roles || "Rôle staff non renseigné"}</p>
              {profile.staff_experience && <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[color:var(--text-muted)]">{profile.staff_experience}</p>}
            </div>
          )}
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Médias & actualités</p>
            <h2 className="font-display mt-2 text-[2rem] leading-tight text-[color:var(--text-main)]">Temps forts</h2>
          </div>
          <Link href="/app/joueur/fil" className="text-sm font-medium text-[color:var(--primary)]">Publier une actualité</Link>
        </div>

        {media && media.length > 0 && <PlayerMediaGrid media={media} />}

        {profilePosts.length > 0 && (
          <div className="post-list-wide">
            {profilePosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} viewerRole="player" index={index} />
            ))}
          </div>
        )}

        {(!media || media.length === 0) && profilePosts.length === 0 && (
          <div className="premium-card rounded-[24px] p-6 text-[color:var(--text-muted)]">
            Aucun temps fort pour le moment. Publie une actualité avec une image ou une vidéo pour l’afficher ici.
          </div>
        )}
      </section>
    </main>
  );
}
