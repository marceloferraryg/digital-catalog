"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Users,
  Settings,
  X,
} from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

type AdminSidebarProps = {
  admin: {
    name: string;
    username: string;
    role: string;
  };
  permissions: string[] | null;
  open: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permissions: [],
  },
  {
    label: "Produtos",
    href: "/admin/products",
    icon: Package,
    permissions: [
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.availability",
      "products.price",
      "products.images",
    ],
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: Layers,
    permissions: ["categories.view", "categories.manage"],
  },
  {
    label: "Marcas",
    href: "/admin/brands",
    icon: Tag,
    permissions: ["brands.view", "brands.manage"],
  },
  {
    label: "Usuários",
    href: "/admin/users",
    icon: Users,
    permissions: [],
    masterOnly: true,
  },
  {
    label: "Configurações",
    href: "/admin/settings",
    icon: Settings,
    permissions: ["settings.manage"],
  },
];

export default function AdminSidebar({
  admin,
  permissions,
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Fundo do menu no mobile */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-(--border) 
                    bg-(--surface) transition-transform duration-300 md:translate-x-0 ${
                      open ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-(--border) px-6 md:justify-center">
          <div className="hidden md:block">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={150}
              height={50}
              priority
            />
          </div>

          <p className=" px-3 text-sm font-semibold uppercase tracking-wider text-(--muted) md:hidden ">
            Menu principal
          </p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="flex rounded-full p-2 w-12 h-12 items-center justify-center 
                        hover:bg-(--background) md:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-sm font-semibold uppercase tracking-wider text-(--muted) hidden md:block">
            Menu principal
          </p>

          {permissions === null && admin.role !== "master" ? (
            <div className="mx-3 rounded-lg border border-(--border) p-3">
              <p className="text-sm font-medium text-(--foreground)">
                Erro ao carregar o menu
              </p>
              <p className="mt-1 text-xs text-(--muted)">
                Saia da sua conta e entre novamente. Se o problema persistir,
                contate o administrador.
              </p>
            </div>
          ) : (
            menuItems.map((item) => {
              const Icon = item.icon;

              const isMaster = admin.role === "master";

              const hasPermission =
                item.permissions.length === 0 ||
                item.permissions.some((permission) =>
                  permissions?.includes(permission),
                );

              if (item.masterOnly && !isMaster) return null;

              if (!isMaster && !hasPermission) return null;

              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex group items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-(--primary)"
                      : "hover:bg-(--background) hover:text-(--foreground)"
                  }`}
                >
                  <Icon
                    size={19}
                    className={`${
                      active
                        ? "text-black"
                        : "text-(--muted) group-hover:text-(--foreground)"
                    }`}
                  />

                  <p
                    className={`${
                      active
                        ? "text-black font-bold"
                        : "text-(--muted) group-hover:text-(--foreground)"
                    }`}
                  >
                    {item.label}
                  </p>
                </Link>
              );
            })
          )}
        </nav>

        {/* Identificação */}
        <div className="border-b border-(--border) px-6 py-4">
          <p className="text-sm font-semibold">{admin.name}</p>
          <p className="mt-1 text-xs text-(--muted)">
            {admin.role === "master" ? "Administrador Master" : "Administrador"}
          </p>
        </div>

        {/* Sair */}
        <div className="border-t border-(--border) p-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
