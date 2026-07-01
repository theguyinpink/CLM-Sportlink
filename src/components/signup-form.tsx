"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/password-field";
import { signUpClubFromClient, signUpPlayerFromClient } from "@/app/auth-actions";

type SignupFormProps = {
  role: "player" | "club";
  defaultError?: string;
};

export default function SignupForm({ role, defaultError }: SignupFormProps) {
  const router = useRouter();
  const [error, setError] = useState(defaultError || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setError("Email ou mot de passe manquant.");
      setLoading(false);
      return;
    }

    const result =
      role === "club"
        ? await signUpClubFromClient({ email, password })
        : await signUpPlayerFromClient({ email, password });

    if (!result.ok) {
      setError(result.error || "Impossible de créer le compte.");
      setLoading(false);
      return;
    }

    router.push(`/connexion?message=${encodeURIComponent(role === "club" ? "Compte club créé" : "Compte joueur créé")}`);
    router.refresh();
  }

  return (
    <>
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
          />
        </div>

        <PasswordField />

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-2xl px-4 py-3 font-medium text-[#07080f] transition disabled:cursor-not-allowed disabled:opacity-60 ${role === "club" ? "bg-[#9b5cff] hover:bg-[#c4a1ff]" : "bg-[#4f8cff] hover:bg-[#00d4ff]"}`}
        >
          {loading
            ? "Création..."
            : role === "club"
              ? "Créer mon compte club"
              : "Créer mon compte joueur"}
        </button>
      </form>
    </>
  );
}
