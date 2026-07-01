"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FeedbackInput = {
  category?: string;
  type?: string;
  feedback_type?: string;
  rating?: number | string | null;
  page_url?: string;
  pageUrl?: string;
  page_path?: string;
  pagePath?: string;
  path?: string;
  message?: string;
  content?: string;
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

export async function submitBetaFeedback(input: FeedbackInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      ok: false,
      error: "Tu dois être connecté pour envoyer un retour.",
    };

  const message = clean(input.message ?? input.content);
  if (message.length < 8)
    return { ok: false, error: "Le retour est trop court." };

  const role = user.user_metadata?.role || "unknown";
  const rawRating =
    typeof input.rating === "string" ? Number(input.rating) : input.rating;
  const rating =
    typeof rawRating === "number" && rawRating >= 1 && rawRating <= 5
      ? rawRating
      : null;
  const feedbackType =
    clean(input.feedback_type ?? input.category ?? input.type) || "general";
  const pageUrl = clean(
    input.page_url ??
      input.pageUrl ??
      input.page_path ??
      input.pagePath ??
      input.path,
  );

  const { error } = await supabase.from("beta_feedback").insert({
    user_id: user.id,
    user_role: role,
    feedback_type: feedbackType,
    rating,
    page_url: pageUrl,
    message,
    status: "new",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/feedback");
  revalidatePath("/app/admin");
  return { ok: true };
}

export async function createBetaFeedbackFromClient(input: FeedbackInput) {
  return submitBetaFeedback(input);
}
