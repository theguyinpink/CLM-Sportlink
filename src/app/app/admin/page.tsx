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
    <article className="premium-card rounded-[30px] p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className="font-display mt-4 text-[3rem] leading-none text-white">{value}</p>
      {helper && <p className="mt-3 text-sm leading-6 text-white/52">{helper}</p>}
    </article>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">{eyebrow}</p>
      <h2 className="font-display mt-4 text-[2.8rem] uppercase leading-[0.9] text-white sm:text-[3.5rem]">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">{description}</p>
    </div>
  );
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
        .limit(10),
    ),
    getData(supabase, "posts", (q) =>
      q.select("*").order("created_at", { ascending: false }).limit(10),
    ),
    getData(supabase, "connection_requests", (q) =>
      q.select("id, status, source_role, created_at, responded_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ),
    getData(supabase, "beta_feedback", (q) =>
      q.select("id, user_id, role, category, rating, page_path, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(12),
    ),
  ]);

  const posts = await resolvePostAuthors(supabase, rawPosts);

  return (
    <main className="space-y-14">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Administration</p>
          <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.8rem] lg:text-[5.7rem]">
            Tableau
            <br />
            de contrôle
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
            Vue privée de CLM SportLink pour suivre les joueurs, clubs, annonces, publications et demandes.
          </p>
        </div>

        <div className="premium-card rounded-[26px] px-5 py-4 text-sm text-white/62">
          Connecté admin : <span className="text-white">{user.email}</span>
        </div>
      </section>

      {!serviceRoleReady && (
        <section className="rounded-[30px] border border-amber-400/20 bg-amber-400/10 p-6 text-amber-100">
          <p className="font-medium">Configuration admin incomplète</p>
          <p className="mt-2 text-sm leading-7 text-amber-100/75">
            La page est accessible, mais les actions de modération complètes nécessitent la variable
            <code className="mx-1 rounded bg-black/25 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>
            dans <code className="mx-1 rounded bg-black/25 px-1.5 py-0.5">.env.local</code>.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Joueurs" value={playerCount} helper="Profils joueurs créés" />
        <StatCard label="Clubs" value={clubCount} helper="Fiches clubs créées" />
        <StatCard label="Annonces" value={`${activeOfferCount}/${offerCount}`} helper="Actives / total" />
        <StatCard label="Publications" value={`${publicPostCount}/${postCount}`} helper="Visibles / total" />
        <StatCard label="Demandes" value={requestCount} helper="Demandes de mise en relation" />
        <StatCard label="Acceptées" value={acceptedRequestCount} helper="Contacts débloqués" />
        <StatCard label="Retours bêta" value={`${newFeedbackCount}/${feedbackCount}`} helper="Nouveaux / total" />
        <StatCard label="Service role" value={serviceRoleReady ? "OK" : "À configurer"} helper="Actions admin sécurisées" />
      </section>


      <section className="space-y-8">
        <SectionTitle
          eyebrow="Bêta"
          title="Retours testeurs"
          description="Tous les retours envoyés depuis l’espace connecté arrivent ici pour suivre les bugs, idées et problèmes mobile."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {feedbacks.length === 0 ? (
            <div className="premium-card rounded-[30px] p-6 text-white/62">Aucun retour bêta pour le moment.</div>
          ) : (
            feedbacks.map((feedback: any) => (
              <article key={feedback.id} className="premium-card rounded-[30px] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#35e6a5]/25 bg-[#35e6a5]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#35e6a5]">
                    {safeText(feedback.category, "retour")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {safeText(feedback.status, "new")}
                  </span>
                  {feedback.rating ? (
                    <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8bb7ff]">
                      note {feedback.rating}/5
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/72">{safeText(feedback.message, "Retour vide")}</p>
                <p className="mt-4 text-xs leading-6 text-white/42">
                  {safeText(feedback.role, "Utilisateur")} • {safeText(feedback.page_path, "Page non précisée")} • {compactDate(feedback.created_at)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
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
        </div>
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Modération"
          title="Dernières publications"
          description="Tu peux masquer une publication, la réactiver ou la supprimer définitivement avec ses médias stockés."
        />

        <div className="grid gap-5">
          {posts.length === 0 ? (
            <div className="premium-card rounded-[30px] p-6 text-white/62">Aucune publication pour le moment.</div>
          ) : (
            posts.map((post: any) => (
              <article key={post.id} className="premium-card rounded-[30px] p-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8bb7ff]">
                        {post.author_type || post.author_role || "player"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {post.visibility || "public"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {getPostContentLabel(post.content_type)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {safeText(post.title, post.resolved_author_label)}
                    </h3>
                    <p className="mt-2 text-sm text-white/52">
                      Auteur : {post.resolved_author_label} • {compactDate(post.created_at)}
                    </p>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/68">
                      {safeText(post.text_content, "Publication sans texte")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.visibility === "public" ? (
                      <AdminActionButton
                        label="Masquer"
                        title="Masquer la publication ?"
                        description="La publication ne sera plus visible dans le fil d’actualité joueur ou club, mais elle restera conservée dans la base."
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
        </div>
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Recrutement"
          title="Dernières annonces"
          description="Tu peux désactiver une annonce problématique ou la réactiver si besoin."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {offers.length === 0 ? (
            <div className="premium-card rounded-[30px] p-6 text-white/62">Aucune annonce pour le moment.</div>
          ) : (
            offers.map((offer: any) => (
              <article key={offer.id} className="premium-card rounded-[30px] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">
                    {safeText(offer.category, "Annonce")}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {offer.status || "active"}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">{safeText(offer.title, "Annonce sans titre")}</h3>
                <p className="mt-2 text-sm text-white/52">{compactDate(offer.created_at)}</p>
                <p className="mt-4 text-sm leading-7 text-white/64">
                  {safeText(offer.position_needed, "Poste non précisé")} • {safeText(offer.level_required, "Niveau non précisé")} • {safeText(offer.location, "Zone non précisée")}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
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
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <SectionTitle
            eyebrow="Comptes"
            title="Derniers joueurs"
            description="Vue rapide des profils joueurs récemment créés."
          />

          <div className="grid gap-4">
            {players.map((player: any) => (
              <Link key={player.id} href={`/app/club/joueurs/${player.id}`} className="premium-card block rounded-[26px] p-5 transition hover:-translate-y-0.5">
                <p className="font-medium text-white">{safeText(player.display_name, "Joueur sans nom")}</p>
                <p className="mt-2 text-sm text-white/52">
                  {safeText(player.sport)} • {safeText(player.position, "Poste non précisé")} • {safeText(player.level, "Niveau non précisé")}
                </p>
                <p className="mt-2 text-sm text-white/42">{safeText(player.city)} {player.region ? `• ${player.region}` : ""}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle
            eyebrow="Comptes"
            title="Derniers clubs"
            description="Vue rapide des clubs récemment créés."
          />

          <div className="grid gap-4">
            {clubs.map((club: any) => (
              <Link key={club.id} href={`/app/joueur/clubs/${club.id}`} className="premium-card block rounded-[26px] p-5 transition hover:-translate-y-0.5">
                <p className="font-medium text-white">{safeText(club.club_name, "Club sans nom")}</p>
                <p className="mt-2 text-sm text-white/52">
                  {safeText(club.sport)} • {safeText(club.level, "Niveau non précisé")}
                </p>
                <p className="mt-2 text-sm text-white/42">{safeText(club.city)} {club.region ? `• ${club.region}` : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow="Relations"
          title="Dernières demandes"
          description="Suivi des demandes envoyées, acceptées ou refusées sur la plateforme."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {requests.length === 0 ? (
            <div className="premium-card rounded-[30px] p-6 text-white/62">Aucune demande pour le moment.</div>
          ) : (
            requests.map((request: any) => (
              <article key={request.id} className="premium-card rounded-[26px] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {request.status || "pending"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    source : {request.source_role || "?"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-white/52">Créée le {compactDate(request.created_at)}</p>
                {request.responded_at && <p className="mt-2 text-sm text-white/42">Réponse le {compactDate(request.responded_at)}</p>}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
