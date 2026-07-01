"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/password-field";

type LoginFormProps = {
  defaultMessage?: string;
  defaultError?: string;
};

export default function LoginForm({ defaultMessage, defaultError }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(defaultError || "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setError("Email ou mot de passe manquant.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    let role = data.user?.user_metadata?.role as string | undefined;

    if (!role && data.user?.id) {
      const { data: club } = await supabase
        .from("clubs")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      role = club ? "club" : "player";
    }

    router.push(role === "club" ? "/app/club/feed" : "/app/joueur/feed");
    router.refresh();
  }

  return (
    <>
      {defaultMessage && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {defaultMessage}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm text-[#B3BAC7]">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-2xl border border-[#263152] bg-[#0d1020] px-4 py-3 text-[#f4f7fb] outline-none transition placeholder:text-[#7E8796] focus:border-[#4f8cff]/40"
            placeholder="ton@email.com"
          />
        </div>

        <PasswordField />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#4f8cff] px-4 py-3 font-medium text-[#07080f] transition hover:bg-[#00d4ff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </>
  );
}
