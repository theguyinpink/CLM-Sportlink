import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { acceptRequest, refuseRequest } from "@/app/connection-actions";
import PlayerAvatar from "@/components/player-avatar";
import EmptyState from "@/components/empty-state";

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

export default async function ClubNotificationsPage({
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

  const { data: club } = await supabase
    .from("clubs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!club) redirect("/app/club/profil/edit");

  const { data: requests } = await supabase
    .from("connection_requests")
    .select("*, player_profiles(id, display_name, sport, position, level, city, avatar_path)")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-12">
      <section className="max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Notifications</p>
        <h1 className="font-display mt-5 text-[3.1rem] uppercase leading-[0.9] text-white sm:text-[4.4rem]">
          Demandes
          <br />
          reçues
        </h1>
        <p className="mt-6 text-base leading-8 text-white/68">
          Les joueurs qui souhaitent entrer en relation avec ton club apparaissent ici.
        </p>
      </section>

      {message && <div className="rounded-full border border-[#4f8cff]/25 bg-[#4f8cff]/10 px-5 py-3 text-sm text-[#8bb7ff]">{message}</div>}
      {error && <div className="rounded-full border border-red-500/25 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div>}

      <section className="grid gap-5 border-t border-white/5 pt-8 lg:grid-cols-2">
        {!requests || requests.length === 0 ? (
          <EmptyState eyebrow="Aucune notification" title="Rien à traiter" description="Quand une nouvelle demande arrivera, elle apparaîtra ici avec ses actions." ctaHref="/app/club/feed" ctaLabel="Retour à l’accueil" />
        ) : (
          requests.map((request: any, index: number) => {
            const player = Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles;
            const playerHref = player?.id ? `/app/club/joueurs/${player.id}` : "/app/club/joueurs";

            return (
              <article key={request.id} className="premium-card animate-fade-up rounded-[30px] p-5" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <PlayerAvatar avatarPath={player?.avatar_path} displayName={player?.display_name || "Joueur"} size="md" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${statusClass(request.status)}`}>
                        {statusLabel(request.status)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Joueur
                      </span>
                    </div>

                    <Link href={playerHref} className="group mt-4 inline-flex">
                      <h2 className="font-display text-[2.1rem] uppercase leading-[0.92] text-white transition group-hover:text-[#8bb7ff]">
                        {player?.display_name || "Un joueur"}
                      </h2>
                    </Link>

                    <p className="mt-3 text-sm leading-7 text-white/66">
                      {player?.sport || "Sport"}{player?.position ? ` • ${player.position}` : ""}{player?.level ? ` • ${player.level}` : ""}{player?.city ? ` • ${player.city}` : ""}
                    </p>

                    {request.status === "pending" && request.source_role === "player" && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <form action={acceptRequest}>
                          <input type="hidden" name="request_id" value={request.id} />
                          <button className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612] transition hover:-translate-y-0.5">
                            Accepter
                          </button>
                        </form>
                        <form action={refuseRequest}>
                          <input type="hidden" name="request_id" value={request.id} />
                          <button className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/5">
                            Refuser
                          </button>
                        </form>
                        <Link href={playerHref} className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
                          Voir le joueur
                        </Link>
                      </div>
                    )}
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
