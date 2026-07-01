"use client";

import { useId, useState } from "react";

type FileInputProps = {
  name: string;
  accept?: string;
  required?: boolean;
  label?: string;
  helper?: string;
};

function formatSize(bytes: number) {
  if (!bytes) return "0 Ko";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function FileInput({
  name,
  accept,
  required,
  label = "Choisir un fichier",
  helper,
}: FileInputProps) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="group flex cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white transition hover:border-[#4f8cff]/45 hover:bg-[#4f8cff]/10"
      >
        <span className="min-w-0">
          <span className="block font-medium text-white">
            {file ? file.name : label}
          </span>
          <span className="mt-1 block truncate text-xs text-white/45">
            {file ? `Fichier importé • ${formatSize(file.size)}` : helper || "Clique pour sélectionner un fichier"}
          </span>
        </span>

        <span className="shrink-0 rounded-full bg-gradient-to-r from-[#4f8cff] to-[#00d4ff] px-4 py-2 text-xs font-bold text-[#050612] transition group-hover:scale-[1.02]">
          {file ? "Changer" : "Choisir"}
        </span>
      </label>

      <input
        id={id}
        type="file"
        name={name}
        accept={accept}
        required={required}
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="sr-only"
      />
    </div>
  );
}
