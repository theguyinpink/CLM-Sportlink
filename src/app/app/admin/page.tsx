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
  adminUpdateFeedbackStatus,
} from "@/app/app/admin/actions";

function safeText(value?: string | null, fallback = "Non renseigné") {
  const text = String(value || "").trim();
  return text || fallback;
}

function compactDate(value?: string | null) {
  return formatPostDate(value);
}

function shortText(value?: string | null, fallback = "Non renseigné", max = 110) {
  const text = safeText(value, fallback);
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
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
          : author?.display_name || "Joueur inconnu",
    };
  });
}

function StatCard({ label, value, helper }: { label: string; value: number | string; helper?: string }) {
  return (
    <article className="premium-card rounded-[22px] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="font-display mt-2 text-[2rem] leading-none text-white">{value}</p>
      {helper && <p className="mt-2 text-xs leading-5 text-white/48">{helper}</p>}
    </article>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="premium-card rounded-[28px] p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-white/6 pb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/32">{eyebrow}</p>
          <h2 className="font-display mt-2 text-[1.65rem] uppercase leading-none text-white sm:text-[2rem]">
            {title}
          </h2>
        </div>
      </div>
      <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">{children}</div>
    </section>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/52">{children}</div>;
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
    newFeedbackCount,
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
    getCount(supabase, "beta_feedback", (q) => q.eq("status", "new")),
  ]);

  const [players, clubs, offers, rawPosts, requests, feedbacks] = await Promise.all([
    getData(supabase, "player_profiles", (q) =>
      q.select("id, user_id, display_name, sport, position, level, city, region, created_at, is_public, open_to_opportunities")
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    getData(supabase, "clubs", (q) =>
      q.select("id, user_id, club_name, sport, level, city, region, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    getData(supabase, "club_offers", (q) =>
      q.select("id, club_id, title, category, position_needed, level_required, location, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    getData(supabase, "posts", (q) =>
      q.select("*").order("created_at", { ascending: false }).limit(8),
    ),
    getData(supabase, "connection_requests", (q) =>
      q.select("id, status, source_role, created_at, responded_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ),
    getData(supabase, "beta_feedback", (q) =>
      q.select("id, user_id, user_role, feedback_type, rating, page_url, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ),
  ]);

  const posts = await resolvePostAuthors(supabase, rawPosts);

  return (
    <main className="space-y-6 pb-10">
      <section className="premium-card rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/35">Administration</p>
            <h1 className="font-display mt-3 text-[2.6rem] uppercase leading-[0.9] text-white sm:text-[3.6rem]">
              Tableau de contrôle
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
              Vue compacte pour suivre les comptes, annonces, publications, demandes et retours bêta.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/58">
            Admin : <span className="text-white">{user.email}</span>
          </div>
        </div>
      </section>

      {!serviceRoleReady && (
        <section className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <span className="font-medium">Configuration admin incomplète.</span>{" "}
          Ajoute <code className="rounded bg-black/25 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> pour les actions de modération complètes.
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <StatCard label="Joueurs" value={playerCount} helper="Profils" />
        <StatCard label="Clubs" value={clubCount} helper="Fiches" />
        <StatCard label="Annonces" value={`${activeOfferCount}/${offerCount}`} helper="Actives / total" />
        <StatCard label="Posts" value={`${publicPostCount}/${postCount}`} helper="Visibles / total" />
        <StatCard label="Demandes" value={requestCount} helper="Total" />
        <StatCard label="Acceptées" value={acceptedRequestCount} helper="Contacts" />
        <StatCard label="Retours" value={`${newFeedbackCount}/${feedbackCount}`} helper="Nouveaux / total" />
        <StatCard label="Service" value={serviceRoleReady ? "OK" : "Non"} helper="Admin key" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Bêta" title="Retours testeurs">
          {feedbacks.length === 0 ? (
            <EmptyLine>Aucun retour bêta pour le moment.</EmptyLine>
          ) : (
            feedbacks.map((feedback: any) => (
              <article key={feedback.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#35e6a5]/25 bg-[#35e6a5]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#35e6a5]">
                    {safeText(feedback.feedback_type, "retour")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {safeText(feedback.status, "new")}
                  </span>
                  {feedback.rating ? (
                    <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8bb7ff]">
                      {feedback.rating}/5
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/72">{shortText(feedback.message, "Retour vide", 150)}</p>
                <p className="mt-3 text-xs leading-5 text-white/42">
                  {safeText(feedback.user_role, "Utilisateur")} • {safeText(feedback.page_url, "Page non précisée")} • {compactDate(feedback.created_at)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminActionButton
                    label="Vu"
                    title="Marquer ce retour comme vu ?"
                    description="Le retour restera dans l’admin, mais ne sera plus compté comme nouveau."
                    confirmLabel="Marquer vu"
                    action={adminUpdateFeedbackStatus.bind(null, feedback.id, "reviewed")}
                  />
                  <AdminActionButton
                    label="Traité"
                    title="Marquer ce retour comme traité ?"
                    description="À utiliser quand le bug ou la remarque a été traité."
                    confirmLabel="Marquer traité"
                    variant="success"
                    action={adminUpdateFeedbackStatus.bind(null, feedback.id, "done")}
                  />
                </div>
              </article>
            ))
          )}
        </Panel>

        <Panel eyebrow="Modération" title="Publications">
          {posts.length === 0 ? (
            <EmptyLine>Aucune publication pour le moment.</EmptyLine>
          ) : (
            posts.map((post: any) => (
              <article key={post.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8bb7ff]">
                        {post.author_type || post.author_role || "player"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                        {post.visibility || "public"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                        {getPostContentLabel(post.content_type)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{safeText(post.title, post.resolved_author_label)}</h3>
                    <p className="mt-1 text-xs text-white/45">{post.resolved_author_label} • {compactDate(post.created_at)}</p>
                    <p className="mt-3 text-sm leading-6 text-white/62">{shortText(post.text_content, "Publication sans texte", 150)}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {post.visibility === "public" ? (
                      <AdminActionButton
                        label="Masquer"
                        title="Masquer la publication ?"
                        description="La publication ne sera plus visible dans le fil, mais restera conservée dans la base."
                        confirmLabel="Masquer"
                        action={adminHidePost.bind(null, post.id)}
                      />
                    ) : (
                      <AdminActionButton
                        label="Réactiver"
                        title="Réactiver la publication ?"
                        description="La publication redeviendra visible dans le fil d’actualité."
                        confirmLabel="Réactiver"
                        variant="success"
                        action={adminRestorePost.bind(null, post.id)}
                      />
                    )}
                    <AdminActionButton
                      label="Supprimer"
                      title="Supprimer définitivement ?"
                      description="Cette action supprime la publication et ses médias associés. Elle ne pourra pas être annulée."
                      confirmLabel="Supprimer"
                      variant="danger"
                      action={adminDeletePost.bind(null, post.id)}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Recrutement" title="Annonces">
          {offers.length === 0 ? (
            <EmptyLine>Aucune annonce pour le moment.</EmptyLine>
          ) : (
            offers.map((offer: any) => (
              <article key={offer.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#c4a1ff]">
                        {safeText(offer.category, "Annonce")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                        {offer.status || "active"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{safeText(offer.title, "Annonce sans titre")}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/48">
                      {safeText(offer.position_needed, "Poste non précisé")} • {safeText(offer.level_required, "Niveau non précisé")} • {safeText(offer.location, "Zone non précisée")} • {compactDate(offer.created_at)}
                    </p>
                  </div>

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
              </article>
            ))
          )}
        </Panel>

        <Panel eyebrow="Relations" title="Demandes">
          {requests.length === 0 ? (
            <EmptyLine>Aucune demande pour le moment.</EmptyLine>
          ) : (
            requests.map((request: any) => (
              <article key={request.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {request.status || "pending"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    source : {request.source_role || "?"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/52">Créée le {compactDate(request.created_at)}</p>
                {request.responded_at && <p className="mt-1 text-xs text-white/42">Réponse le {compactDate(request.responded_at)}</p>}
              </article>
            ))
          )}
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Comptes" title="Joueurs">
          {players.length === 0 ? (
            <EmptyLine>Aucun joueur pour le moment.</EmptyLine>
          ) : (
            players.map((player: any) => (
              <Link key={player.id} href={`/app/club/joueurs/${player.id}`} className="block rounded-[22px] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#4f8cff]/25 hover:bg-[#4f8cff]/10">
                <p className="font-medium text-white">{safeText(player.display_name, "Joueur sans nom")}</p>
                <p className="mt-2 text-sm text-white/52">
                  {safeText(player.sport)} • {safeText(player.position, "Poste non précisé")} • {safeText(player.level, "Niveau non précisé")}
                </p>
                <p className="mt-1 text-xs text-white/40">{safeText(player.city)} {player.region ? `• ${player.region}` : ""}</p>
              </Link>
            ))
          )}
        </Panel>

        <Panel eyebrow="Comptes" title="Clubs">
          {clubs.length === 0 ? (
            <EmptyLine>Aucun club pour le moment.</EmptyLine>
          ) : (
            clubs.map((club: any) => (
              <Link key={club.id} href={`/app/joueur/clubs/${club.id}`} className="block rounded-[22px] border border-white/8 bg-white/[0.03] p-4 transition hover:border-[#4f8cff]/25 hover:bg-[#4f8cff]/10">
                <p className="font-medium text-white">{safeText(club.club_name, "Club sans nom")}</p>
                <p className="mt-2 text-sm text-white/52">{safeText(club.sport)} • {safeText(club.level, "Niveau non précisé")}</p>
                <p className="mt-1 text-xs text-white/40">{safeText(club.city)} {club.region ? `• ${club.region}` : ""}</p>
              </Link>
            ))
          )}
        </Panel>
      </section>
    </main>
  );
}
