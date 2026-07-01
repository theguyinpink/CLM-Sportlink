import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClubLogo from "@/components/club-logo";
import { getCategoryLabel } from "@/lib/matching";

export default async function PublicClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!club) notFound();

  const { data: offers } = await supabase
    .from("club_offers")
    .select("*")
    .eq("club_id", club.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <ClubLogo logoPath={club.logo_path} clubName={club.club_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Identité du club</p>
              <h1 className="font-display mt-5 text-[3.6rem] uppercase leading-[0.9] text-white sm:text-[5rem]">{club.club_name}</h1>
              <p className="mt-4 text-white/68">{club.sport}{club.level ? ` • ${club.level}` : ""}{club.city ? ` • ${club.city}` : ""}</p>
            </div>
          </div>
          <Link href="/connexion?message=Connecte-toi+pour+entrer+en+contact" className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612]">Entrer en contact</Link>
        </div>
      </section>

      <section className="mt-16 grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-t border-white/5 pt-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Projet club</p>
          <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{club.description || "Aucune description pour le moment."}</p>
        </div>

        <div className="border-t border-white/5 pt-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Annonces actives</p>
          <div className="mt-6 space-y-6">
            {!offers || offers.length === 0 ? (
              <p className="text-white/68">Aucune annonce active.</p>
            ) : (
              offers.map((offer) => (
                <article key={offer.id} className="premium-card rounded-[28px] p-5">
                  <span className="rounded-full border border-[#9b5cff]/25 bg-[#9b5cff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#c4a1ff]">{getCategoryLabel(offer.category)}</span>
                  <h2 className="font-display mt-4 text-[2.2rem] uppercase leading-[0.92] text-white">{offer.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/68">{offer.position_needed || "Poste non précisé"}{offer.level_required ? ` • ${offer.level_required}` : ""}{offer.location ? ` • ${offer.location}` : ""}</p>
                  <p className="mt-4 text-sm leading-8 text-white/68">{offer.description || "Aucune description."}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
