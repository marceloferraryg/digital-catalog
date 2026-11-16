"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserPlus,
  Users,
  ShieldCheck,
  Mail,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import type { AdminPermission, AdminUser } from "@/lib/supabase/users";

type UsersManagerProps = {
  initialUsers: AdminUser[];
  permissionOptions: AdminPermission[];
};

const permissionGroups = [
  {
    title: "Produtos",
    codes: [
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
    title: "Categorias",
    codes: ["categories.view", "categories.manage"],
  },
  {
    title: "Marcas",
    codes: ["brands.view", "brands.manage"],
  },
  {
    title: "Configurações",
    codes: ["settings.manage"],
  },
];

export default function UsersManager({
  initialUsers,
  permissionOptions,
}: UsersManagerProps) {
  const router = useRouter();

  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = editingUserId !== null;

  function resetForm() {
    setEditingUserId(null);
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setSelectedPermissions([]);
    setError("");
    setSuccess("");
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  }

  function handleEdit(user: AdminUser) {
    if (user.role === "master") return;

    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setSelectedPermissions(user.permissions.map((permission) => permission.id));
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function refreshUsers() {
    const response = await fetch("/api/admin/users", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Não foi possível atualizar a listagem.");
    }

    setUsers(result.users);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isEditing ? { id: editingUserId } : {}),
          name,
          username,
          email,
          password,
          permissionIds: selectedPermissions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Não foi possível ${isEditing ? "atualizar" : "cadastrar"} o usuário.`,
        );
      }

      await refreshUsers();

      setSuccess(
        isEditing
          ? "Administrador atualizado com sucesso!"
          : "Administrador cadastrado com sucesso!",
      );

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao salvar o administrador.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-(--foreground)">Usuários</h1>
        <p className="mt-2 text-sm text-(--muted)">
          Gerencie os administradores e suas permissões de acesso.
        </p>
      </div>

      {/* Cadastro e edição */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
            {isEditing ? <Pencil size={20} /> : <UserPlus size={20} />}
          </div>

          <div>
            <h2 className="font-semibold text-(--foreground)">
              {isEditing ? "Editar administrador" : "Novo administrador"}
            </h2>
            <p className="text-sm text-(--muted)">
              {isEditing
                ? "Atualize os dados e as permissões do administrador."
                : "Cadastre um usuário e defina suas permissões."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="user-name"
                className="mb-2 block text-sm font-medium text-(--foreground)"
              >
                Nome completo
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                placeholder="Nome do administrador"
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
              />
            </div>

            <div>
              <label
                htmlFor="user-username"
                className="mb-2 block text-sm font-medium text-(--foreground)"
              >
                Username
              </label>
              <input
                id="user-username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
                minLength={3}
                maxLength={30}
                required
                placeholder="ex: joao.silva"
                autoComplete="off"
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
              />
              <p className="mt-1 text-xs text-(--muted)">
                Use letras minúsculas, números, ponto, hífen ou underline.
              </p>
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="mb-2 block text-sm font-medium text-(--foreground)"
              >
                E-mail
              </label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
                placeholder="usuario@email.com"
                autoComplete="off"
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
              />
            </div>

            <div>
              <label
                htmlFor="user-password"
                className="mb-2 block text-sm font-medium text-(--foreground)"
              >
                {isEditing ? "Nova senha (opcional)" : "Senha inicial"}
              </label>
              <input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isEditing ? undefined : 6}
                maxLength={256}
                required={!isEditing}
                placeholder={
                  isEditing
                    ? "Deixe vazio para manter a senha atual"
                    : "Mínimo de 6 caracteres"
                }
                autoComplete="new-password"
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
              />
              {isEditing && (
                <p className="mt-1 text-xs text-(--muted)">
                  Preencha somente se desejar trocar a senha.
                </p>
              )}
            </div>
          </div>

          {/* Permissões */}
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-(--foreground)">
                Permissões de acesso
              </h3>
              <p className="mt-1 text-sm text-(--muted)">
                Selecione quais áreas o administrador poderá acessar.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {permissionGroups.map((group) => {
                const groupPermissions = group.codes
                  .map((code) =>
                    permissionOptions.find(
                      (permission) => permission.code === code,
                    ),
                  )
                  .filter((permission): permission is AdminPermission =>
                    Boolean(permission),
                  );

                if (groupPermissions.length === 0) return null;

                return (
                  <div
                    key={group.title}
                    className="rounded-lg border border-(--border) p-4"
                  >
                    <h4 className="mb-3 text-sm font-semibold text-(--foreground)">
                      {group.title}
                    </h4>

                    <div className="space-y-3">
                      {groupPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-start gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              permission.id,
                            )}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-0.5 size-4 accent-(--primary)"
                          />

                          <span>
                            <span className="block text-sm text-(--foreground)">
                              {permission.name}
                            </span>
                            {permission.description && (
                              <span className="mt-0.5 block text-xs text-(--muted)">
                                {permission.description}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
              {success}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-(--border) px-5 py-2.5 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--background) disabled:opacity-50"
              >
                <X size={18} />
                Cancelar edição
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? <Save size={18} /> : <Plus size={18} />}
              {loading
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar administrador"}
            </button>
          </div>
        </form>
      </section>

      {/* Listagem */}
      <section className="rounded-xl border border-(--border) bg-(--surface)">
        <div className="flex items-center justify-between border-b border-(--border) p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
              <Users size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-(--foreground)">
                Administradores cadastrados
              </h2>
              <p className="text-sm text-(--muted)">
                {users.length} usuário{users.length === 1 ? "" : "s"} cadastrado
                {users.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-(--muted)">
            Nenhum administrador cadastrado.
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-(--foreground)">
                      {user.name}
                    </h3>

                    <span className="rounded-full bg-(--primary)/10 px-2.5 py-1 text-xs font-medium text-(--primary)">
                      {user.role === "master" ? "Master" : "Administrador"}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <p className="text-sm text-(--muted)">@{user.username}</p>

                  <p className="flex items-center gap-2 text-sm text-(--muted)">
                    <Mail size={15} />
                    {user.email || "E-mail não encontrado"}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {user.role === "master" ? (
                      <span className="flex items-center gap-1.5 rounded-md bg-(--primary)/10 px-2.5 py-1.5 text-xs text-(--primary)">
                        <ShieldCheck size={14} />
                        Acesso total
                      </span>
                    ) : user.permissions.length > 0 ? (
                      user.permissions.map((permission) => (
                        <span
                          key={permission.id}
                          className="rounded-md bg-(--background) px-2.5 py-1.5 text-xs text-(--muted)"
                        >
                          {permission.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-(--muted)">
                        Nenhuma permissão atribuída
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {user.role === "master" ? (
                    <span className="text-xs text-(--muted)">
                      Conta protegida
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-sm text-(--foreground) transition-colors hover:bg-(--background)"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled
                        title="Exclusão será implementada na próxima etapa"
                        className="flex items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-sm text-red-500 opacity-50"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
