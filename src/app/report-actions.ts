"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  error?: string;
};

const VALID_TARGETS = new Set([
  "post",
  "comment",
  "club_offer",
  "player_profile",
  "club",
]);

const VALID_REASONS = new Set([
  "fake_content",
  "inappropriate",
  "spam",
  "wrong_category",
  "other",
]);

function clean(value?: string | null) {
  return String(value || "").trim();
}

export async function createContentReportFromClient(input: {
  target_type: string;
  target_id: string;
  reason: string;
  details?: string | null;
  page_url?: string | null;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Tu dois être connecté." };

  const targetType = clean(input.target_type);
  const targetId = clean(input.target_id);
  const reason = clean(input.reason) || "other";
  const details = clean(input.details) || null;
  const pageUrl = clean(input.page_url) || null;
  const role = user.user_metadata?.role === "club" ? "club" : "player";

  if (!VALID_TARGETS.has(targetType) || !targetId) {
    return { ok: false, error: "Élément à signaler introuvable." };
  }

  if (!VALID_REASONS.has(reason)) {
    return { ok: false, error: "Motif invalide." };
  }

  const { error } = await supabase.from("content_reports").insert({
    reporter_user_id: user.id,
    reporter_role: role,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
    page_url: pageUrl,
    status: "open",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/admin");
  return { ok: true };
}
