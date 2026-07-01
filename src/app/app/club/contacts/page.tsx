import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerAvatar from "@/components/player-avatar";
import EmptyState from "@/components/empty-state";
import { formatPostDate } from "@/lib/posts";

export default async function ClubContactsPage() {
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
    .select("id, accepted_at:responded_at, created_at, player_profiles(id, display_name, sport, position, level, city, region, avatar_path, contact_email, contact_phone, roles_available)")
    .eq("club_id", club.id)
    .eq("status", "accepted")
    .order("responded_at", { ascending: false });

  const contacts = (requests || []).map((request: any) => ({
    request,
    profile: Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles,
  })).filter((item: any) => item.profile?.id);

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Contacts</p>
        <h1 className="font-display mt-2 text-[2.4rem] leading-tight text-[color:var(--text-main)]">Contacts débloqués</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Retrouve les profils sportifs avec lesquels une mise en relation a été acceptée.
        </p>
      </section>

      {contacts.length === 0 ? (
        <EmptyState eyebrow="Aucun contact" title="Aucun contact débloqué" description="Quand une demande sera acceptée, le profil apparaîtra ici avec ses coordonnées." ctaHref="/app/club/joueurs" ctaLabel="Voir les profils" />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {contacts.map(({ request, profile }: any, index: number) => (
            <article key={request.id} className="premium-card animate-fade-up rounded-[26px] p-5" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="flex items-start gap-4">
                <PlayerAvatar avatarPath={profile.avatar_path} displayName={profile.display_name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Profil sportif</p>
                  <h2 className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">{profile.display_name}</h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{[profile.sport, profile.position, profile.level, profile.city || profile.region].filter(Boolean).join(" • ")}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4 text-sm leading-6 text-[color:var(--text-soft)]">
                <p className="break-all"><span className="font-medium text-[color:var(--text-main)]">Email :</span> {profile.contact_email || "Non renseigné"}</p>
                <p><span className="font-medium text-[color:var(--text-main)]">Téléphone :</span> {profile.contact_phone || "Non renseigné"}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Débloqué le {formatPostDate(request.accepted_at || request.created_at)}</p>
              </div>
              <Link href={`/app/club/joueurs/${profile.id}`} className="mt-5 inline-flex text-sm font-medium text-[color:var(--primary)]">Voir le profil</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
