import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubLogo from "@/components/club-logo";
import EmptyState from "@/components/empty-state";
import { formatPostDate } from "@/lib/posts";

export default async function PlayerContactsPage() {
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

  const { data: requests } = await supabase
    .from("connection_requests")
    .select("id, accepted_at:responded_at, created_at, clubs(id, club_name, sport, level, city, region, logo_path, contact_email, contact_phone)")
    .eq("player_profile_id", profile.id)
    .eq("status", "accepted")
    .order("responded_at", { ascending: false });

  const contacts = (requests || []).map((request: any) => ({
    request,
    club: Array.isArray(request.clubs) ? request.clubs[0] : request.clubs,
  })).filter((item: any) => item.club?.id);

  return (
    <main className="space-y-7">
      <section className="premium-card rounded-[28px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Contacts</p>
        <h1 className="font-display mt-2 text-[2.4rem] leading-tight text-[color:var(--text-main)]">Mes contacts débloqués</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">
          Retrouve les clubs avec lesquels une demande a été acceptée. Les coordonnées sont visibles après accord mutuel.
        </p>
      </section>

      {contacts.length === 0 ? (
        <EmptyState eyebrow="Aucun contact" title="Aucun contact débloqué" description="Quand une demande sera acceptée, le club apparaîtra ici avec ses coordonnées." ctaHref="/app/joueur/opportunites" ctaLabel="Voir les opportunités" />
      ) : (
        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {contacts.map(({ request, club }: any, index: number) => (
            <article key={request.id} className="premium-card animate-fade-up rounded-[26px] p-5" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="flex items-start gap-4">
                <ClubLogo logoPath={club.logo_path} clubName={club.club_name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Club</p>
                  <h2 className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">{club.club_name}</h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">{[club.sport, club.level, club.city || club.region].filter(Boolean).join(" • ")}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4 text-sm leading-6 text-[color:var(--text-soft)]">
                <p className="break-all"><span className="font-medium text-[color:var(--text-main)]">Email :</span> {club.contact_email || "Non renseigné"}</p>
                <p><span className="font-medium text-[color:var(--text-main)]">Téléphone :</span> {club.contact_phone || "Non renseigné"}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Débloqué le {formatPostDate(request.accepted_at || request.created_at)}</p>
              </div>
              <Link href={`/app/joueur/clubs/${club.id}`} className="mt-5 inline-flex text-sm font-medium text-[color:var(--primary)]">Voir la fiche club</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
