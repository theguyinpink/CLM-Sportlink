import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubLogo from "@/components/club-logo";
import OnboardingCard from "@/components/onboarding-card";
import ContactCounterModal from "@/components/contact-counter-modal";
import { calculateClubCompletion, getCategoryLabel } from "@/lib/matching";

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

  const [{ data: offers }, { data: acceptedRequests }] = await Promise.all([
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
  ]);

  const contacts = (acceptedRequests || [])
    .map((request: any) => {
      const player = Array.isArray(request.player_profiles) ? request.player_profiles[0] : request.player_profiles;
      if (!player?.id) return null;
      return {
        id: player.id,
        name: player.display_name || "Joueur",
        subtitle: [player.sport, player.position, player.level, player.city].filter(Boolean).join(" • "),
        imagePath: player.avatar_path,
        href: `/app/club/joueurs/${player.id}`,
        type: "player" as const,
      };
    })
    .filter(Boolean);

  const completion = calculateClubCompletion(club);

  return (
    <main className="space-y-14">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <ClubLogo logoPath={club.logo_path} clubName={club.club_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Identité du club</p>
              <h1 className="font-display mt-5 text-[3.2rem] uppercase leading-[0.9] text-white sm:text-[4.6rem]">{club.club_name}</h1>
              <p className="mt-4 text-white/68">{club.sport}{club.level ? ` • ${club.level}` : ""}{club.city ? ` • ${club.city}` : ""}</p>
            </div>
          </div>

          <Link href="/app/club/profil/edit" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/4">Modifier</Link>
        </div>
      </section>

      <OnboardingCard
        title="Crédibilité club"
        description="Une fiche complète rassure les joueurs et donne plus de matière au moteur de compatibilité."
        score={completion.score}
        checks={completion.checks}
        ctaHref="/app/club/parametres"
        ctaLabel="Ajouter logo ou contacts"
      />

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Sport</p><p className="mt-3 text-white">{club.sport || "Non renseigné"}</p></div>
        <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Niveau</p><p className="mt-3 text-white">{club.level || "Non renseigné"}</p></div>
        <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Zone</p><p className="mt-3 text-white">{club.city || club.region || "Non renseignée"}</p></div>
        <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Annonces</p><p className="mt-3 text-white">{offers?.length || 0} récente(s)</p></div>
        <ContactCounterModal label="Nombre de contacts" contacts={contacts as any} />
      </section>

      <section className="grid gap-16 border-t border-white/5 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div className="premium-card rounded-[30px] p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Contact club</p>
            <div className="mt-5 space-y-4 text-white/72">
              <p>Email : {club.contact_email || "Non renseigné"}</p>
              <p>Téléphone : {club.phone || "Non renseigné"}</p>
            </div>
          </div>

          <Link href="/app/club/annonces/new" className="inline-flex rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612]">Créer une annonce</Link>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Projet sportif</p>
          <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{club.description || "Aucune description pour le moment."}</p>
        </div>
      </section>

      <section className="border-t border-white/5 pt-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Annonces</p>
            <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Besoins actuels</h2>
          </div>
          <Link href="/app/club/annonces" className="text-sm font-medium text-[#4f8cff]">Voir tout</Link>
        </div>

        {!offers || offers.length === 0 ? (
          <p className="text-white/62">Aucune annonce pour le moment.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {offers.map((offer) => (
              <article key={offer.id} className="premium-card rounded-[28px] p-5">
                <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">{getCategoryLabel(offer.category)}</span>
                <h3 className="font-display mt-4 text-[2rem] uppercase leading-[0.94] text-white">{offer.title}</h3>
                <p className="mt-3 text-sm text-white/62">{offer.position_needed || "Poste non précisé"}{offer.level_required ? ` • ${offer.level_required}` : ""}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
