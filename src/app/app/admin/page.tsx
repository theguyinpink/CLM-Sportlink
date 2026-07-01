import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRoleKey, requireAdminUser } from "@/lib/admin";
import { formatPostDate, getPostContentLabel } from "@/lib/posts";
import AdminActionButton from "@/components/admin/admin-action-button";
import {
  adminDeactivateOffer,
  adminDeletePost,
  adminHidePost,
  adminReactivateOffer,
  adminRestorePost,
} from "@/app/app/admin/actions";

function safeText(value?: string | null, fallback = "Non renseigné") {
  const text = String(value || "").trim();
  return text || fallback;
}

function compactDate(value?: string | null) {
  return formatPostDate(value);
}

function statusLabel(status?: string | null) {
  if (status === "accepted") return "Acceptée";
  if (status === "refused") return "Refusée";
  if (status === "pending") return "En attente";
  if (status === "active") return "Active";
  if (status === "closed") return "Désactivée";
  if (status === "public") return "Visible";
  if (status === "hidden") return "Masquée";
  return safeText(status, "Statut");
}

function statusClass(status?: string | null) {
  if (status === "accepted" || status === "active" || status === "public") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "refused" || status === "closed" || status === "hidden") {
    return "border-red-500/25 bg-red-500/10 text-red-300";
  }
  if (status === "open") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  }
  return "border-[color:var(--line)] bg-[color:var(--surface-soft)] text-[color:var(--text-soft)]";
}

async function getCount(supabase: any, table: string, filters?: (query: any) => any) {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filters) query = filters(query);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getData(supabase: any, table: string, queryBuilder: (query: any) => any) {
  try {
    const query = queryBuilder(supabase.from(table));
    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}

async function resolvePostAuthors(supabase: any, posts: any[]) {
  const playerIds = Array.from(new Set(posts.map((post) => post.player_profile_id).filter(Boolean)));
  const clubIds = Array.from(new Set(posts.map((post) => post.club_id).filter(Boolean)));
  const authorUserIds = Array.from(
    new Set(posts.map((post) => post.author_user_id || post.user_id).filter(Boolean)),
  );

  const [playersById, playersByUser, clubsById, clubsByUser] = await Promise.all([
    playerIds.length
      ? getData(supabase, "player_profiles", (q) =>
          q.select("id, user_id, display_name, sport, city, region").in("id", playerIds),
        )
      : [],
    authorUserIds.length
      ? getData(supabase, "player_profiles", (q) =>
          q.select("id, user_id, display_name, sport, city, region").in("user_id", authorUserIds),
        )
      : [],
    clubIds.length
      ? getData(supabase, "clubs", (q) =>
          q.select("id, user_id, club_name, sport, city, region").in("id", clubIds),
        )
      : [],
    authorUserIds.length
      ? getData(supabase, "clubs", (q) =>
          q.select("id, user_id, club_name, sport, city, region").in("user_id", authorUserIds),
        )
      : [],
  ]);

  const playerById = new Map(playersById.map((player: any) => [player.id, player]));
  const playerByUser = new Map(playersByUser.map((player: any) => [player.user_id, player]));
  const clubById = new Map(clubsById.map((club: any) => [club.id, club]));
  const clubByUser = new Map(clubsByUser.map((club: any) => [club.user_id, club]));

  return posts.map((post) => {
    const authorType = post.author_type || post.author_role || "player";
    const authorUserId = post.author_user_id || post.user_id || null;
    const author: any =
      authorType === "club"
        ? clubById.get(post.club_id) || clubByUser.get(authorUserId)
        : playerById.get(post.player_profile_id) || playerByUser.get(authorUserId);

    return {
      ...post,
      resolved_author: author || null,
      resolved_author_label:
        authorType === "club"
          ? author?.club_name || "Club inconnu"
          : author?.display_name || "Profil inconnu",
    };
  });
}

function getPostHref(post: any) {
  const authorType = post.author_type || post.author_role || "player";
  const author = post.resolved_author || null;

  if (authorType === "club") {
    const clubId = post.club_id || author?.id;
    return clubId ? `/clubs/${clubId}#post-${post.id}` : `/app/club/fil#post-${post.id}`;
  }

  const playerId = post.player_profile_id || author?.id;
  return playerId ? `/joueurs/${playerId}#post-${post.id}` : `/app/joueur/fil#post-${post.id}`;
}

function getOfferHref(offer: any) {
  return `/app/joueur/opportunites#offer-${offer.id}`;
}

function getRequestHref(request: any) {
  const player = Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles;
  const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;

  if (player?.id) return `/joueurs/${player.id}`;
  if (club?.id) return `/clubs/${club.id}`;
  return "/app/admin";
}

function MetricCard({ label, value, helper }: { label: string; value: number | string; helper?: string }) {
  return (
    <article className="premium-card rounded-[20px] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dim)]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold leading-none text-[color:var(--text-main)]">{value}</p>
        {helper && <p className="max-w-[110px] text-right text-[11px] leading-4 text-[color:var(--text-muted)]">{helper}</p>}
      </div>
    </article>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--text-main)]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[color:var(--text-muted)]">{description}</p>}
      </div>
    </div>
  );
}

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`ui-pill rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.10em] ${className}`}>
      {children}
    </span>
  );
}

function EmptyCompact({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">{children}</div>;
}

export default async function AdminPage() {
  const user = await requireAdminUser();
  const serverClient = await createClient();
  const adminClient = createAdminClient();
  const supabase = adminClient || serverClient;
  const serviceRoleReady = hasServiceRoleKey();

  const [
    playerCount,
    clubCount,
    offerCount,
    activeOfferCount,
    postCount,
    publicPostCount,
    requestCount,
    acceptedRequestCount,
    feedbackCount,
    openReportCount,
  ] = await Promise.all([
    getCount(supabase, "player_profiles"),
    getCount(supabase, "clubs"),
    getCount(supabase, "club_offers"),
    getCount(supabase, "club_offers", (q) => q.eq("status", "active")),
    getCount(supabase, "posts"),
    getCount(supabase, "posts", (q) => q.eq("visibility", "public")),
    getCount(supabase, "connection_requests"),
    getCount(supabase, "connection_requests", (q) => q.eq("status", "accepted")),
    getCount(supabase, "beta_feedback"),
    getCount(supabase, "content_reports", (q) => q.eq("status", "open")),
  ]);

  const [players, clubs, offers, rawPosts, requests, betaFeedback, contentReports] = await Promise.all([
    getData(supabase, "player_profiles", (q) =>
      q.select("id, user_id, display_name, sport, position, level, city, region, created_at, is_public, open_to_opportunities")
        .order("created_at", { ascending: false })
        .limit(7),
    ),
    getData(supabase, "clubs", (q) =>
      q.select("id, user_id, club_name, sport, level, city, region, created_at")
        .order("created_at", { ascending: false })
        .limit(7),
    ),
    getData(supabase, "club_offers", (q) =>
      q.select("id, club_id, title, offer_type, category, sport, position_needed, level_required, location, status, created_at")
        .order("created_at", { ascending: false })
        .limit(7),
    ),
    getData(supabase, "posts", (q) => q.select("*").order("created_at", { ascending: false }).limit(7)),
    getData(supabase, "connection_requests", (q) =>
      q.select("id, status, source_role, club_id, player_profile_id, created_at, responded_at, player_profiles(id, display_name), clubs(id, club_name)")
        .order("created_at", { ascending: false })
        .limit(7),
    ),
    getData(supabase, "beta_feedback", (q) =>
      q.select("id, user_role, feedback_type, message, page_url, rating, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ),
    getData(supabase, "content_reports", (q) =>
      q.select("id, reporter_role, target_type, target_id, reason, details, page_url, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ),
  ]);

  const posts = await resolvePostAuthors(supabase, rawPosts);

  return (
    <main className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-main)] sm:text-4xl">
            Tableau de contrôle
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Vue compacte pour suivre la bêta, les contenus et les comptes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Pill>{user.email}</Pill>
          <Pill className={serviceRoleReady ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}>
            Service role : {serviceRoleReady ? "OK" : "à configurer"}
          </Pill>
          <Pill>Version 4.0</Pill>
        </div>
      </section>

      {!serviceRoleReady && (
        <section className="rounded-[22px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">
          La variable <code className="rounded bg-black/20 px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> manque pour les actions de modération complètes.
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Joueurs" value={playerCount} />
        <MetricCard label="Clubs" value={clubCount} />
        <MetricCard label="Annonces" value={`${activeOfferCount}/${offerCount}`} helper="actives / total" />
        <MetricCard label="Publications" value={`${publicPostCount}/${postCount}`} helper="visibles / total" />
        <MetricCard label="Demandes" value={requestCount} helper="mises en relation" />
        <MetricCard label="Acceptées" value={acceptedRequestCount} helper="contacts débloqués" />
        <MetricCard label="Retours bêta" value={feedbackCount} />
        <MetricCard label="Signalements" value={openReportCount} helper="ouverts" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Retours testeurs" description="Derniers messages envoyés via Retour bêta." />
          <div className="space-y-3">
            {betaFeedback.length === 0 ? (
              <EmptyCompact>Aucun retour bêta pour le moment.</EmptyCompact>
            ) : (
              betaFeedback.map((feedback: any) => (
                <article key={feedback.id} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>{safeText(feedback.feedback_type, "retour")}</Pill>
                    <Pill>{safeText(feedback.user_role, "user")}</Pill>
                    {feedback.rating && <Pill>Note {feedback.rating}/5</Pill>}
                    <span className="ml-auto text-xs text-[color:var(--text-muted)]">{compactDate(feedback.created_at)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-soft)]">{safeText(feedback.message, "Message vide")}</p>
                  {feedback.page_url && <p className="mt-2 truncate text-xs text-[color:var(--text-dim)]">{feedback.page_url}</p>}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Signalements" description="Profils, annonces et publications signalés." />
          <div className="space-y-3">
            {contentReports.length === 0 ? (
              <EmptyCompact>Aucun signalement pour le moment.</EmptyCompact>
            ) : (
              contentReports.map((report: any) => (
                <article key={report.id} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>{safeText(report.target_type, "contenu")}</Pill>
                    <Pill>{safeText(report.reason, "motif")}</Pill>
                    <Pill className={statusClass(report.status)}>{statusLabel(report.status)}</Pill>
                    <span className="ml-auto text-xs text-[color:var(--text-muted)]">{compactDate(report.created_at)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-soft)]">{safeText(report.details, "Aucun détail ajouté")}</p>
                  <p className="mt-2 truncate text-xs text-[color:var(--text-dim)]">ID : {safeText(report.target_id)}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Dernières publications" description="Compactes, cliquables, avec actions rapides." />
          <div className="divide-y divide-[color:var(--line)]">
            {posts.length === 0 ? (
              <EmptyCompact>Aucune publication pour le moment.</EmptyCompact>
            ) : (
              posts.map((post: any) => (
                <div key={post.id} className="grid gap-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <Link href={getPostHref(post)} className="group min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill>{post.author_type === "club" || post.author_role === "club" ? "Club" : "Profil"}</Pill>
                      <Pill className={statusClass(post.visibility)}>{statusLabel(post.visibility || "public")}</Pill>
                      <Pill>{getPostContentLabel(post.content_type)}</Pill>
                    </div>
                    <p className="mt-2 truncate font-medium text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">
                      {safeText(post.title, post.resolved_author_label)}
                    </p>
                    <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                      {post.resolved_author_label} • {compactDate(post.created_at)} • {safeText(post.text_content, "Sans texte")}
                    </p>
                  </Link>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {post.visibility === "public" ? (
                      <AdminActionButton
                        label="Masquer"
                        title="Masquer la publication ?"
                        description="Elle ne sera plus visible dans le fil, mais restera conservée."
                        confirmLabel="Masquer"
                        action={adminHidePost.bind(null, post.id)}
                      />
                    ) : (
                      <AdminActionButton
                        label="Réactiver"
                        title="Réactiver la publication ?"
                        description="Elle redeviendra visible dans le fil d’actualité."
                        confirmLabel="Réactiver"
                        variant="success"
                        action={adminRestorePost.bind(null, post.id)}
                      />
                    )}
                    <AdminActionButton
                      label="Supprimer"
                      title="Supprimer définitivement ?"
                      description="Cette action supprime la publication et ses médias associés."
                      confirmLabel="Supprimer"
                      variant="danger"
                      action={adminDeletePost.bind(null, post.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Dernières annonces" description="Activer ou désactiver rapidement." />
          <div className="divide-y divide-[color:var(--line)]">
            {offers.length === 0 ? (
              <EmptyCompact>Aucune annonce pour le moment.</EmptyCompact>
            ) : (
              offers.map((offer: any) => (
                <div key={offer.id} className="grid gap-3 py-3">
                  <Link href={getOfferHref(offer)} className="group min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill>{safeText(offer.offer_type || offer.category, "Annonce")}</Pill>
                      <Pill className={statusClass(offer.status || "active")}>{statusLabel(offer.status || "active")}</Pill>
                    </div>
                    <p className="mt-2 truncate font-medium text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">
                      {safeText(offer.title, "Annonce sans titre")}
                    </p>
                    <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                      {safeText(offer.sport, "Sport")} • {safeText(offer.position_needed, "Rôle non précisé")} • {safeText(offer.level_required, "Niveau non précisé")} • {compactDate(offer.created_at)}
                    </p>
                  </Link>

                  <div className="flex flex-wrap gap-2">
                    {offer.status === "active" ? (
                      <AdminActionButton
                        label="Désactiver"
                        title="Désactiver cette annonce ?"
                        description="Elle ne sera plus mise en avant dans les opportunités compatibles."
                        confirmLabel="Désactiver"
                        action={adminDeactivateOffer.bind(null, offer.id)}
                      />
                    ) : (
                      <AdminActionButton
                        label="Réactiver"
                        title="Réactiver cette annonce ?"
                        description="Elle redeviendra visible dans les opportunités compatibles."
                        confirmLabel="Réactiver"
                        variant="success"
                        action={adminReactivateOffer.bind(null, offer.id)}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Derniers joueurs" />
          <div className="divide-y divide-[color:var(--line)]">
            {players.length === 0 ? (
              <EmptyCompact>Aucun joueur.</EmptyCompact>
            ) : (
              players.map((player: any) => (
                <Link key={player.id} href={`/joueurs/${player.id}`} className="group block py-3">
                  <p className="truncate font-medium text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">
                    {safeText(player.display_name, "Joueur sans nom")}
                  </p>
                  <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                    {safeText(player.sport)} • {safeText(player.position, "Poste non précisé")} • {safeText(player.level, "Niveau non précisé")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Derniers clubs" />
          <div className="divide-y divide-[color:var(--line)]">
            {clubs.length === 0 ? (
              <EmptyCompact>Aucun club.</EmptyCompact>
            ) : (
              clubs.map((club: any) => (
                <Link key={club.id} href={`/clubs/${club.id}`} className="group block py-3">
                  <p className="truncate font-medium text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">
                    {safeText(club.club_name, "Club sans nom")}
                  </p>
                  <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                    {safeText(club.sport)} • {safeText(club.level, "Niveau non précisé")} • {safeText(club.city, "Ville non précisée")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="premium-card rounded-[24px] p-4">
          <SectionHeader title="Dernières demandes" />
          <div className="divide-y divide-[color:var(--line)]">
            {requests.length === 0 ? (
              <EmptyCompact>Aucune demande.</EmptyCompact>
            ) : (
              requests.map((request: any) => {
                const player = Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles;
                const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;

                return (
                  <Link key={request.id} href={getRequestHref(request)} className="group block py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className={statusClass(request.status)}>{statusLabel(request.status)}</Pill>
                      <span className="text-xs text-[color:var(--text-muted)]">{compactDate(request.created_at)}</span>
                    </div>
                    <p className="mt-2 truncate font-medium text-[color:var(--text-main)] group-hover:text-[color:var(--primary)]">
                      {safeText(player?.display_name, "Profil")} ↔ {safeText(club?.club_name, "Club")}
                    </p>
                    <p className="mt-1 truncate text-sm text-[color:var(--text-muted)]">
                      Source : {safeText(request.source_role, "?")}{request.responded_at ? ` • Réponse ${compactDate(request.responded_at)}` : ""}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
