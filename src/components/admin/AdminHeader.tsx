"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Menu, UserCircle } from "lucide-react";

type AdminHeaderProps = {
  admin: {
    name: string;
    username: string;
    role: string;
  };
  onMenuClick: () => void;
};

export default function AdminHeader({ admin, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-(--border) bg-(--background) px-4 sm:px-6">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="flex rounded-lg w-12 h-12 p-2 items-center justify-center transition hover:bg-(--surface) md:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="md:hidden">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={150}
            height={50}
            priority
          />
        </div>

        <span className="hidden text-sm text-(--muted) md:block">
          Painel administrativo
        </span>

        <div className="flex items-center gap-3">
          <UserCircle size={22} className="text-(--muted)" />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{admin.name}</p>
            <p className="text-xs text-(--muted)">
              {admin.role === "master" ? "Master" : "Administrador"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
