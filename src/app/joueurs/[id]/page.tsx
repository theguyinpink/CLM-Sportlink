import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerAvatar from "@/components/player-avatar";
import PlayerMediaGrid from "@/components/player-media-grid";
import OnboardingCard from "@/components/onboarding-card";
import PostCard from "@/components/post-card";
import { calculatePlayerCompletion } from "@/lib/matching";
import { getPublicPostsByPlayerProfile } from "@/lib/post-feed";

export default async function PublicPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("player_profiles")
    .select("*, player_media(*)")
    .eq("id", id)
    .or("is_public.eq.true,is_public.is.null")
    .maybeSingle();

  if (!player) notFound();

  const media = (player.player_media || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  const [{ data: { user } }, profilePosts] = await Promise.all([
    supabase.auth.getUser(),
    getPublicPostsByPlayerProfile(supabase, player.id, player.user_id, 8),
  ]);
  const completion = calculatePlayerCompletion(player);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="premium-card rounded-[40px] p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-start gap-5">
            <PlayerAvatar avatarPath={player.avatar_path} displayName={player.display_name} size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">CV sportif public</p>
              <h1 className="font-display mt-5 text-[3.6rem] uppercase leading-[0.9] text-white sm:text-[5rem]">{player.display_name}</h1>
              <p className="mt-4 text-white/68">{player.sport}{player.position ? ` • ${player.position}` : ""}{player.level ? ` • ${player.level}` : ""}</p>
            </div>
          </div>
          <Link href="/connexion?message=Connecte-toi+pour+entrer+en+contact" className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-5 py-3 text-sm font-bold text-[#050612]">Entrer en contact</Link>
        </div>
      </section>

      <div className="mt-12">
        <OnboardingCard title="Qualité du profil" description="Indice de complétion public basé sur les informations visibles." score={completion.score} checks={completion.checks} />
      </div>

      <section className="mt-16 grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Ville</p><p className="mt-3 text-white">{player.city || "Non renseignée"}</p></div>
          <div className="premium-card rounded-[28px] p-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Région</p><p className="mt-3 text-white">{player.region || "Non renseignée"}</p></div>
        </div>
        <div className="border-t border-white/5 pt-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Résumé sportif</p>
          <p className="mt-5 whitespace-pre-line text-base leading-9 text-white/68">{player.bio || "Aucune bio pour le moment."}</p>
        </div>
      </section>

      <section className="mt-16 space-y-8 border-t border-white/5 pt-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Médias & actualités</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">Temps forts</h2>
        </div>

        {media.length > 0 && <PlayerMediaGrid media={media} />}

        {profilePosts.length > 0 && (
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Publications récentes</p>
            {profilePosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} viewerRole="player" index={index} />
            ))}
          </div>
        )}

        {media.length === 0 && profilePosts.length === 0 && (
          <p className="text-white/68">Aucun temps fort public pour le moment.</p>
        )}
      </section>
    </main>
  );
}
