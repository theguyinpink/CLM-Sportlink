import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppRootPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const role = user.user_metadata?.role;

  if (role === "club") {
    redirect("/app/club/feed");
  }

  redirect("/app/joueur/feed");
}