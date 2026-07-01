import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubLogo from "@/components/club-logo";
import ContactCounterModal from "@/components/contact-counter-modal";
import PostCard from "@/components/post-card";
import { calculateClubCompletion, getCategoryLabel } from "@/lib/matching";
import { getPublicPostsByClub } from "@/lib/post-feed";

export default async function ClubProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!club) redirect("/app/club/profil/edit");

  const [{ data: offers }, { data: acceptedRequests }, clubPosts] = await Promise.all([
    supabase
      .from("club_offers")
      .select("*")
      .eq("club_id", club.id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("connection_requests")
      .select("*, player_profiles(id, display_name, sport, position, level, city, avatar_path)")
      .eq("club_id", club.id)
      .eq("status", "accepted")
      .order("responded_at", { ascending: false }),
    getPublicPostsByClub(supabase, club.id, club.user_id, 8),
  ]);

  const contacts = (acceptedRequests || [])
    .map((request: any) => {
      const player = Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles;
      if (!player?.id) return null;
      return {
        id: player.id,
        name: player.display_name || "Profil sportif",
        subtitle: [player.sport, player.position, player.level, player.city].filter(Boolean).join(" • "),
        imagePath: player.avatar_path,
        href: `/app/club/joueurs/${player.id}`,
        type: "player" as const,
      };
    })
    .filter(Boolean);

  const completion = calculateClubCompletion(club);
  const missing = completion.checks.filter((check) => !check.done).slice(0, 4);

  return (
    <main className="profile-shell">
      <section className="profile-hero-grid">
        <div className="premium-card rounded-[28px] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-5">
              <ClubLogo logoPath={club.logo_path} clubName={club.club_name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Fiche club</p>
                  {completion.score === 100 && <span className="ui-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Fiche complétée</span>}
                  <span className="ui-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Actif récemment</span>
                </div>
                <h1 className="font-display mt-3 text-[2.7rem] leading-[0.98] text-[color:var(--text-main)] sm:text-[3.6rem]">
                  {club.club_name}
                </h1>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-soft)]">
                  {[club.sport, club.level, club.city || club.region].filter(Boolean).join(" • ") || "Informations club à compléter"}
                </p>

                <div className="profile-stats mt-5">
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Sport</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{club.sport || "À compléter"}</p>
                  </div>
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Niveau</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{club.level || "À compléter"}</p>
                  </div>
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Zone</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{club.city || club.region || "À compléter"}</p>
                  </div>
                  <div className="profile-stat">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Annonces</p>
                    <p className="mt-2 font-medium text-[color:var(--text-main)]">{offers?.length || 0} récente(s)</p>
                  </div>
                  <ContactCounterModal label="Contacts" contacts={contacts as any} variant="stat" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link href="/app/club/annonces/new" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                Créer une annonce
              </Link>
              <Link href="/app/club/profil/edit" className="btn-secondary rounded-full px-5 py-3 text-sm font-medium">
                Modifier
              </Link>
            </div>
          </div>

          {club.description && (
            <div className="mt-7 border-t border-[color:var(--line)] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Projet sportif</p>
              <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-8 text-[color:var(--text-soft)]">{club.description}</p>
            </div>
          )}
        </div>

        {completion.score < 100 && (
          <aside className="compact-completion">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Fiche complétée</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text-main)]">{completion.score}%</p>
              </div>
              <Link href="/app/club/profil/edit" className="rounded-full border border-[color:var(--line)] px-3 py-2 text-xs font-medium text-[color:var(--primary)]">
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

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Annonces</p>
            <h2 className="font-display mt-2 text-[2rem] leading-tight text-[color:var(--text-main)]">Besoins actuels</h2>
          </div>
          <Link href="/app/club/annonces" className="text-sm font-medium text-[color:var(--primary)]">Voir tout</Link>
        </div>

        {!offers || offers.length === 0 ? (
          <div className="premium-card rounded-[24px] p-6 text-[color:var(--text-muted)]">Aucune annonce pour le moment.</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
            {offers.map((offer) => (
              <article key={offer.id} className="premium-card rounded-[24px] p-5">
                <span className="ui-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">{getCategoryLabel(offer.category)}</span>
                <h3 className="font-display mt-4 text-[1.55rem] leading-tight text-[color:var(--text-main)]">{offer.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">
                  {[offer.sport || club.sport, offer.position_needed, offer.level_required, offer.location || club.city].filter(Boolean).join(" • ") || "Détails à compléter"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Médias & actualités</p>
            <h2 className="font-display mt-2 text-[2rem] leading-tight text-[color:var(--text-main)]">Temps forts du club</h2>
          </div>
          <Link href="/app/club/fil" className="text-sm font-medium text-[color:var(--primary)]">Publier une actualité</Link>
        </div>

        {clubPosts.length === 0 ? (
          <div className="premium-card rounded-[24px] p-6 text-[color:var(--text-muted)]">
            Aucune actualité pour le moment. Publie depuis le bouton + pour faire vivre la fiche du club.
          </div>
        ) : (
          <div className="post-list-wide">
            {clubPosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} viewerRole="club" index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
