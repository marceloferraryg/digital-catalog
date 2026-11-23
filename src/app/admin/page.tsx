import Link from "next/link";
import { connection } from "next/server";
import {
  Package,
  Layers,
  Tags,
  Users,
  Settings,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ImageOff,
  BadgeAlert,
  Plus,
  Eye,
  Clock3,
} from "lucide-react";

import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";
import { getDashboardStats } from "@/lib/supabase/dashboard";
import { getRecentProductActivities } from "@/lib/supabase/activity-logs";

export default async function AdminPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    return null;
  }

  const permissions =
    admin.role === "master" ? [] : await getAdminPermissions(admin.id);

  if (admin.role !== "master" && permissions === null) {
    throw new Error("Não foi possível verificar as permissões.");
  }

  const canView = (permission: string) =>
    admin.role === "master" || permissions?.includes(permission) === true;

  const canManage = (permission: string) =>
    admin.role === "master" || permissions?.includes(permission) === true;

  const canManageSettings =
    admin.role === "master" || permissions?.includes("settings.manage");

  const canViewProducts = canView("products.view");
  const canCreateProducts = canManage("products.create");

  const stats = await getDashboardStats(admin.role === "master");

  const recentActivities = canViewProducts
    ? await getRecentProductActivities(5)
    : [];

  const availabilityPercentage =
    stats.products.total > 0
      ? (stats.products.available / stats.products.total) * 100
      : 0;

  const modules = [
    {
      title: "Categorias",
      description: "Organize os produtos por categorias.",
      href: "/admin/categories",
      icon: Layers,
      visible: canView("categories.view"),
      total: stats.categories.total,
      detail: `${stats.categories.active} ativas`,
    },
    {
      title: "Marcas",
      description: "Gerencie as marcas dos produtos.",
      href: "/admin/brands",
      icon: Tags,
      visible: canView("brands.view"),
      total: stats.brands.total,
      detail: `${stats.brands.active} ativas`,
    },
    {
      title: "Administradores",
      description: "Gerencie usuários e permissões.",
      href: "/admin/users",
      icon: Users,
      visible: admin.role === "master",
      total: stats.users.total,
      detail: `${stats.users.active} ativos`,
    },
  ];

  const visibleModules = modules.filter((module) => module.visible);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--foreground)">Dashboard</h1>

        <p className="mt-2 text-sm text-(--muted)">
          Bem-vindo, <span className="font-semibold">{admin.name}</span>.
          Confira o resumo da sua loja.
        </p>
      </div>

      <div className="space-y-6 mb-16">
        {canViewProducts && (
          <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-xl bg-(--background) 
                                text-(--foreground)"
                >
                  <Package size={25} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-(--foreground)">
                    Produtos
                  </h2>
                  <p className="text-sm text-(--muted)">
                    Visão geral do catálogo da loja
                  </p>
                </div>
              </div>

              <Link
                href="/admin/products"
                className="flex items-center gap-2 text-sm font-medium text-(--primary) hover:underline"
              >
                Gerenciar produtos
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-(--background) p-4">
                <p className="text-sm text-(--muted)">Total de produtos</p>
                <p className="mt-1 text-3xl font-bold text-(--foreground)">
                  {stats.products.total}
                </p>
                <p className="mt-1 text-xs text-(--muted)">
                  Cadastrados no catálogo
                </p>
              </div>

              <div className="rounded-lg bg-(--background) p-4">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 size={17} />
                  <p className="text-sm font-medium">Disponíveis</p>
                </div>
                <p className="mt-1 text-3xl font-bold text-(--foreground)">
                  {stats.products.available}
                </p>
                <p className="mt-1 text-xs text-(--muted)">
                  Visíveis como disponíveis
                </p>
              </div>

              <div className="rounded-lg bg-(--background) p-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle size={17} />
                  <p className="text-sm font-medium">Indisponíveis</p>
                </div>
                <p className="mt-1 text-3xl font-bold text-(--foreground)">
                  {stats.products.unavailable}
                </p>
                <p className="mt-1 text-xs text-(--muted)">
                  Fora de disponibilidade
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-(--foreground)">
                  Disponibilidade do catálogo
                </p>
                <p className="text-sm font-semibold text-(--foreground)">
                  {availabilityPercentage.toFixed(1).replace(".", ",")}%
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>

            <div className="mt-6 border-t border-(--border) pt-5">
              <h3 className="mb-4 text-sm font-semibold text-(--foreground)">
                Qualidade do catálogo
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/admin/products"
                  className="flex items-center justify-between gap-3 rounded-lg border 
                              border-(--border) p-4 transition-colors hover:bg-(--background)"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg 
                                      bg-(--background) text-amber-500"
                    >
                      <ImageOff size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">
                        Produtos sem imagem
                      </p>
                      <p className="text-xs text-(--muted)">
                        Precisam de fotos
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-semibold text-(--foreground)">
                    {stats.products.withoutImage}
                  </span>
                </Link>

                <Link
                  href="/admin/products"
                  className="flex items-center justify-between gap-3 rounded-lg border 
                              border-(--border) p-4 transition-colors hover:bg-(--background)"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg 
                                    bg-(--background) text-amber-500"
                    >
                      <BadgeAlert size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">
                        Produtos sem preço
                      </p>
                      <p className="text-xs text-(--muted)">
                        Precisam de preço
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-semibold text-(--foreground)">
                    {stats.products.withoutPrice}
                  </span>
                </Link>
              </div>
            </div>

            {(canCreateProducts || canViewProducts) && (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-(--border) pt-5">
                {canCreateProducts && (
                  <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 
                               transition-opacity hover:opacity-90"
                  >
                    <Plus size={22} color="black" />
                    <p className="text-sm font-medium text-black">
                      Novo produto
                    </p>
                  </Link>
                )}

                <Link
                  href="/products"
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--background)"
                >
                  <Eye size={18} />
                  Ver catálogo público
                </Link>
              </div>
            )}
          </section>
        )}

        {visibleModules.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold text-(--muted)">
              Outros módulos
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleModules.map((module) => {
                const Icon = module.icon;

                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="group rounded-xl border border-(--border) bg-(--surface) p-5 transition-colors hover:border-(--primary)"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-(--background) text-(--foreground)">
                        <Icon size={21} />
                      </div>

                      <ArrowUpRight
                        size={19}
                        className="text-(--muted) transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--foreground)"
                      />
                    </div>

                    <p className="text-sm font-medium text-(--muted)">
                      {module.title}
                    </p>

                    <p className="mt-1 text-3xl font-bold text-(--foreground)">
                      {module.total}
                    </p>

                    <p className="mt-2 text-sm text-(--muted)">
                      {module.description}
                    </p>

                    <div className="mt-5 border-t border-(--border) pt-4 text-xs text-(--muted)">
                      {module.detail}
                    </div>
                  </Link>
                );
              })}

              {canManageSettings && (
                <Link
                  href="/admin/settings"
                  className="group rounded-xl border border-(--border) bg-(--surface) p-5 transition-colors hover:border-(--primary)"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-(--background) text-(--foreground)">
                      <Settings size={21} />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-(--muted) transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--foreground)"
                    />
                  </div>

                  <p className="text-sm font-medium text-(--muted)">
                    Configurações
                  </p>

                  <p className="mt-1 text-lg font-semibold text-(--foreground)">
                    Dados da loja
                  </p>

                  <p className="mt-2 text-sm text-(--muted)">
                    Gerencie nome, contato, endereço, horários e redes sociais.
                  </p>

                  <div className="mt-5 border-t border-(--border) pt-4 text-xs text-(--muted)">
                    Personalizar loja
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {canViewProducts && (
          <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-(--foreground)">
                  Últimas atualizações
                </h2>
                <p className="mt-1 text-sm text-(--muted)">
                  Atividades recentes nos produtos
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-lg bg-(--background) text-(--foreground)">
                <Clock3 size={20} />
              </div>
            </div>

            {recentActivities.length > 0 ? (
              <div className="divide-y divide-(--border)">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--foreground)">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-(--muted)">
                        Por {activity.adminName}
                      </p>
                    </div>

                    <time
                      dateTime={activity.created_at}
                      className="shrink-0 text-xs text-(--muted)"
                    >
                      {new Date(activity.created_at).toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-(--muted)">
                Nenhuma atividade registrada ainda.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
