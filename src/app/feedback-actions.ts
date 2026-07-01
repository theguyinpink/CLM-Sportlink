"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  error?: string;
};

const VALID_TYPES = new Set(["bug", "idea", "design", "question", "other"]);

function clean(value?: string | null) {
  return String(value || "").trim();
}

export async function createBetaFeedbackFromClient(input: {
  feedback_type: string;
  message: string;
  page_url?: string | null;
  rating?: number | null;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const feedbackType = clean(input.feedback_type) || "other";
  const message = clean(input.message);
  const pageUrl = clean(input.page_url) || null;
  const role = user.user_metadata?.role === "club" ? "club" : "player";
  const rating = typeof input.rating === "number" && Number.isFinite(input.rating)
    ? Math.max(1, Math.min(5, Math.round(input.rating)))
    : null;

  if (!VALID_TYPES.has(feedbackType)) {
    return { ok: false, error: "Type de retour invalide." };
  }

  if (message.length < 3) {
    return { ok: false, error: "Ton message est trop court." };
  }

  const { error } = await supabase.from("beta_feedback").insert({
    user_id: user.id,
    user_role: role,
    feedback_type: feedbackType,
    message,
    page_url: pageUrl,
    rating,
    status: "new",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/admin");
  return { ok: true };
}
