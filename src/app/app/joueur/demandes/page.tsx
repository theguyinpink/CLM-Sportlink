import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import ClubLogo from "@/components/club-logo";

type SearchParams = {
  scope?: "all" | "sent" | "received";
  status?: "all" | "pending" | "accepted" | "refused";
  sort?: "recent" | "oldest";
};

function statusLabel(status?: string | null) {
  if (status === "accepted") return "Acceptée";
  if (status === "refused") return "Refusée";
  return "En attente";
}

function statusClass(status?: string | null) {
  if (status === "accepted") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (status === "refused") return "border-red-500/25 bg-red-500/10 text-red-300";
  return "border-[#00d4ff]/25 bg-[#00d4ff]/10 text-[#8be9ff]";
}

export default async function JoueurDemandesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const scope = (params.scope || "all") as "all" | "sent" | "received";
  const status = (params.status || "all") as "all" | "pending" | "accepted" | "refused";
  const sort = (params.sort || "recent") as "recent" | "oldest";

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

  let requestsQuery = supabase
    .from("connection_requests")
    .select("*, clubs(id, club_name, sport, city, region, level, contact_email, phone, logo_path)")
    .eq("player_profile_id", profile.id);

  requestsQuery =
    sort === "oldest"
      ? requestsQuery.order("created_at", { ascending: true })
      : requestsQuery.order("created_at", { ascending: false });

  const { data: requests } = await requestsQuery;

  let items = (requests || []).map((request: any) => {
    const club = Array.isArray(request.clubs) ? request.clubs[0] : request.clubs;
    const direction = request.source_role === "player" ? "sent" : "received";
    return { ...request, club, direction };
  });

  if (scope !== "all") items = items.filter((item: any) => item.direction === scope);
  if (status !== "all") items = items.filter((item: any) => item.status === status);

  const hasFilters = scope !== "all" || status !== "all" || sort !== "recent";

  return (
    <main className="space-y-14">
      <section className="max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Demandes</p>
        <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem] lg:text-[5.8rem]">
          Mes demandes
          <br />
          côté joueur
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
          Toutes tes demandes, envoyées ou reçues, avec leur statut et les contacts débloqués.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-white/2 p-5">
        <form className="ui-filter-grid gap-4">
          <select name="scope" defaultValue={scope} className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none">
            <option value="all" className="bg-[#07080f] text-white">Toutes</option>
            <option value="sent" className="bg-[#07080f] text-white">Envoyées</option>
            <option value="received" className="bg-[#07080f] text-white">Reçues</option>
          </select>
          <select name="status" defaultValue={status} className="ui-select w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none">
            <option value="all" className="bg-[#07080f] text-white">Tous statuts</option>
            <option value="pending" className="bg-[#07080f] text-white">En attente</option>
            <option value="accepted" className="bg-[#07080f] text-white">Acceptées</option>
            <option value="refused" className="bg-[#07080f] text-white">Refusées</option>
          </select>
          <div className="flex flex-wrap gap-3">
            <select name="sort" defaultValue={sort} className="ui-select min-w-[190px] flex-1 rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm leading-6 text-white outline-none">
              <option value="recent" className="bg-[#07080f] text-white">Plus récentes</option>
              <option value="oldest" className="bg-[#07080f] text-white">Plus anciennes</option>
            </select>
            <button type="submit" className="rounded-full bg-[#4f8cff] px-5 py-3 text-sm font-medium text-[#07080f] transition hover:bg-[#00d4ff]">Filtrer</button>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/55">
          <span>{items.length} demandes</span>
          {hasFilters && <Link href="/app/joueur/demandes" className="text-[#4f8cff]">Réinitialiser</Link>}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {items.length === 0 ? (
          <EmptyState eyebrow="Aucune demande" title="Rien à afficher" description="Aucune demande ne correspond aux filtres actuels." resetHref="/app/joueur/demandes" ctaHref="/app/joueur/feed" ctaLabel="Retour à l’accueil" />
        ) : (
          items.map((item: any, index: number) => {
            const href = item.club?.id ? `/app/joueur/clubs/${item.club.id}` : "/app/joueur/clubs";
            return (
              <article key={item.id} className="premium-card animate-fade-up rounded-[30px] p-5" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <ClubLogo logoPath={item.club?.logo_path} clubName={item.club?.club_name || "Club"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`ui-pill rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
                      <span className="ui-pill rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {item.direction === "sent" ? "Envoyée" : "Reçue"}
                      </span>
                    </div>
                    <Link href={href} className="group mt-4 inline-flex">
                      <h2 className="font-display text-[2rem] uppercase leading-[0.94] text-white transition group-hover:text-[#8bb7ff]">{item.club?.club_name || "Club"}</h2>
                    </Link>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      {item.club?.sport || "Sport"}{item.club?.city ? ` • ${item.club.city}` : ""}{item.club?.level ? ` • ${item.club.level}` : ""}
                    </p>
                    {item.message_optional_short && <p className="mt-4 text-sm leading-8 text-white/62">{item.message_optional_short}</p>}
                    {item.status === "accepted" && (
                      <div className="mt-5 grid gap-3">
                        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/4 p-4">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Email club</p>
                          <p className="mt-2 max-w-full break-all text-sm leading-6 text-white">{item.club?.contact_email || "Non renseigné"}</p>
                        </div>
                        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/4 p-4">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Téléphone club</p>
                          <p className="mt-2 max-w-full break-words text-sm leading-6 text-white">{item.club?.phone || "Non renseigné"}</p>
                        </div>
                      </div>
                    )}
                    <Link href={href} className="mt-6 inline-flex text-sm font-medium text-[#8bb7ff]">Voir la fiche club</Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
