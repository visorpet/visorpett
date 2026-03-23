"use client";

import React, { useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  currentUrl?: string | null;
  name?: string;
  folder: string;
  onUploaded: (url: string) => void;
  size?: "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  label?: string;
  className?: string;
}

export function PhotoUpload({
  currentUrl,
  name = "",
  folder,
  onUploaded,
  size = "xl",
  shape = "circle",
  label = "Adicionar foto",
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const src = preview ?? currentUrl;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview imediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao fazer upload");
        setPreview(null);
        return;
      }

      onUploaded(json.url);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setPreview(null);
    } finally {
      setUploading(false);
      // Limpa o input para permitir re-seleção do mesmo arquivo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group focus:outline-none"
        aria-label="Alterar foto"
      >
        {shape === "circle" ? (
          <Avatar
            src={src}
            name={name}
            size={size}
            ring
            ringColor="ring-primary/30"
          />
        ) : (
          <div
            className={cn(
              "rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center",
              size === "xl" && "w-24 h-24",
              size === "2xl" && "w-32 h-32",
              src && "ring-2 ring-primary/30"
            )}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
              <MaterialIcon icon="pets" size="lg" className="text-gray-300" />
            )}
          </div>
        )}

        {/* Overlay de edição */}
        <span className={cn(
          "absolute inset-0 flex items-end justify-center pb-1",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
          "bg-black/0 group-hover:bg-black/30 transition-all duration-200"
        )}>
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 rounded-full p-1">
              <MaterialIcon icon="photo_camera" size="sm" className="text-white" />
            </span>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
      >
        {uploading ? "Enviando..." : src ? "Alterar foto" : label}
      </button>

      {error && (
        <p className="text-[11px] text-red-500 font-medium text-center max-w-[160px]">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
