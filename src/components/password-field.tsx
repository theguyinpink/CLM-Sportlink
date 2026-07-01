"use client";

import { useState } from "react";

type PasswordFieldProps = {
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export default function PasswordField({
  name = "password",
  label = "Mot de passe",
  placeholder = "••••••••",
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm text-[#B3BAC7]">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[#263152] bg-[#0d1020] px-4 py-3 pr-24 text-[#f4f7fb] outline-none transition placeholder:text-[#7E8796] focus:border-[#4f8cff]/40"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/68 transition hover:bg-white/5 hover:text-white"
        >
          {visible ? "Masquer" : "Voir"}
        </button>
      </div>
    </div>
  );
}
