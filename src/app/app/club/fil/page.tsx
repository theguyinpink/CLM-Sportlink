import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmptyState from "@/components/empty-state";
import PostCard from "@/components/post-card";
import { calculatePostRelevance } from "@/lib/posts";
import { getPublicPostsForFeed } from "@/lib/post-feed";

export default async function ClubFilPage() {
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

  const posts = await getPublicPostsForFeed(supabase);

  const rankedPosts = posts
    .map((post) => ({
      post,
      relevance: calculatePostRelevance(club, post),
      createdAt: post.created_at ? new Date(post.created_at).getTime() : 0,
    }))
    .sort((a, b) => b.relevance - a.relevance || b.createdAt - a.createdAt)
    .map((item) => item.post);

  return (
    <main className="space-y-10">
      <section className="premium-card overflow-hidden rounded-[42px] p-7 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(155,92,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,212,255,0.12),transparent_35%)]" />
        <div className="relative max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Fil d’actualité</p>
          <h1 className="font-display mt-5 text-[3.4rem] uppercase leading-[0.9] text-white sm:text-[4.8rem] lg:text-[6rem]">
            Le réseau
            <br />
            du recrutement
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Découvre les contenus partagés par les joueurs et les clubs. Pour publier une actualité ou créer une annonce, utilise le bouton + dans la barre du haut.
          </p>
        </div>
      </section>


      <section>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Publications</p>
          <h2 className="font-display mt-3 text-[2.2rem] uppercase leading-[0.92] text-white">
            Joueurs et clubs
          </h2>
        </div>

        <div className="space-y-6">
          {rankedPosts.length === 0 ? (
            <EmptyState
              eyebrow="Aucune publication"
              title="Le fil est encore vide"
              description="Publie la première actualité du club ou attends que les joueurs et clubs commencent à partager leurs contenus."
              resetHref="/app/club/fil"
            />
          ) : (
            rankedPosts.map((post, index) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} viewerRole="club" index={index} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
