"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function clubInterestedInPlayer(formData: FormData) {
  const supabase = await createClient();

  const player_profile_id = String(formData.get("player_profile_id") || "").trim();

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

  const { error } = await supabase.from("connection_requests").insert({
    club_id: club.id,
    player_profile_id,
    source_role: "club",
    status: "pending",
  });

  if (error) {
    redirect(`/app/club/feed?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/club/feed?message=Demande+envoyée");
}

export async function playerInterestedInClub(formData: FormData) {
  const supabase = await createClient();

  const club_id = String(formData.get("club_id") || "").trim();
  const offer_id_raw = String(formData.get("offer_id") || "").trim();
  const offer_id = offer_id_raw || null;

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

  const { error } = await supabase.from("connection_requests").insert({
    club_id,
    player_profile_id: profile.id,
    source_role: "player",
    offer_id,
    status: "pending",
  });

  if (error) {
    redirect(`/app/joueur/feed?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/joueur/feed?message=Demande+envoyée");
}

export async function acceptRequest(formData: FormData) {
  const supabase = await createClient();
  const requestId = String(formData.get("request_id") || "").trim();

  const { error } = await supabase
    .from("connection_requests")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    redirect(`?error=${encodeURIComponent(error.message)}`);
  }

  redirect("?message=Demande+acceptée");
}

export async function refuseRequest(formData: FormData) {
  const supabase = await createClient();
  const requestId = String(formData.get("request_id") || "").trim();

  const { error } = await supabase
    .from("connection_requests")
    .update({
      status: "refused",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    redirect(`?error=${encodeURIComponent(error.message)}`);
  }

  redirect("?message=Demande+refusée");
}