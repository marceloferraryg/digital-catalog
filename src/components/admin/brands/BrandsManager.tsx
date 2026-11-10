"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

type Brand = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

type BrandsManagerProps = {
  initialBrands: Brand[];
};

export default function BrandsManager({ initialBrands }: BrandsManagerProps) {
  const router = useRouter();

  const [brands, setBrands] = useState(initialBrands);

  // Cadastro
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [updating, setUpdating] = useState(false);

  // Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Status
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const [generalError, setGeneralError] = useState("");

  // Requisição de atualização
  async function updateBrand(
    id: string,
    updates: { name?: string; active?: boolean },
  ) {
    const response = await fetch("/api/admin/brands", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Não foi possível atualizar a marca.");
    }

    return result.brand as Brand;
  }

  // Cadastrar marca
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateError("");

    const name = newName.trim();

    if (!name) {
      setCreateError("Informe o nome da marca.");
      return;
    }

    if (name.length > 40) {
      setCreateError("O nome pode ter no máximo 40 caracteres.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível cadastrar.");
      }

      setBrands((current) =>
        [...current, result.brand].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        ),
      );

      setNewName("");
      router.refresh();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setCreating(false);
    }
  }

  // Iniciar edição
  function startEditing(brand: Brand) {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setGeneralError("");
  }

  // Salvar edição
  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    const name = editingName.trim();

    if (!name) {
      setGeneralError("Informe o nome da marca.");
      return;
    }

    if (name.length > 40) {
      setGeneralError("O nome pode ter no máximo 40 caracteres.");
      return;
    }

    setUpdating(true);
    setGeneralError("");

    try {
      const updated = await updateBrand(editingId, { name });

      setBrands((current) =>
        current
          .map((brand) => (brand.id === editingId ? updated : brand))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );

      setEditingId(null);
      setEditingName("");
      router.refresh();
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a marca.",
      );
    } finally {
      setUpdating(false);
    }
  }

  // Ativar ou desativar
  async function handleToggleStatus(brand: Brand) {
    setChangingStatusId(brand.id);
    setGeneralError("");

    try {
      const updated = await updateBrand(brand.id, {
        active: !brand.active,
      });

      setBrands((current) =>
        current.map((item) => (item.id === brand.id ? updated : item)),
      );

      router.refresh();
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status.",
      );
    } finally {
      setChangingStatusId(null);
    }
  }

  // Excluir marca
  async function handleDelete(brand: Brand) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a marca "${brand.name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(brand.id);
    setGeneralError("");

    try {
      const response = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: brand.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível excluir a marca.");
      }

      setBrands((current) => current.filter((item) => item.id !== brand.id));

      router.refresh();
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a marca.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto mb-8 max-w-7xl">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-(--foreground)">Marcas</h1>

          <p className="text-sm text-(--muted)">
            As marcas identificam os fabricantes dos produtos e ajudam os
            clientes a encontrar produtos de suas marcas preferidas.
          </p>
        </div>
      </div>

      {/* Cadastro */}
      <div className="mb-8 rounded-xl border border-(--border) bg-(--surface) p-5">
        <h2 className="mb-4 font-semibold">Adicionar marca</h2>

        <form
          onSubmit={handleCreate}
          className="mb-3 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={newName}
            onChange={(event) => {
              setNewName(event.target.value);
              setCreateError("");
            }}
            placeholder="Digite o nome da marca"
            maxLength={40}
            disabled={creating}
            className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            {creating ? "Adicionando..." : "Adicionar"}
          </button>
        </form>

        {createError && (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {createError}
          </p>
        )}
      </div>

      {/* Listagem */}
      <div className="overflow-hidden rounded-lg border border-(--border) bg-(--surface)">
        <div className="border-b border-(--border) px-5 py-4">
          <h2 className="mb-2 font-semibold">
            Marcas cadastradas
            <span className="ml-2 text-sm font-normal text-(--muted)">
              ({brands.length})
            </span>
          </h2>
        </div>

        {generalError && (
          <div
            role="alert"
            className="border-b border-(--border) bg-red-500/10 px-5 py-3 text-sm text-red-500"
          >
            {generalError}
          </div>
        )}

        {brands.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-medium text-(--foreground)">
              Nenhuma marca cadastrada
            </p>

            <p className="mt-2 text-sm text-(--muted)">
              Comece adicionando a primeira marca do catálogo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-(--background)/30 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Nome da marca */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {editingId === brand.id ? (
                    <form
                      onSubmit={handleUpdate}
                      className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        maxLength={40}
                        autoFocus
                        disabled={updating}
                        className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none"
                      />

                      <div className="mt-1 flex items-center justify-end gap-4 sm:ml-2 sm:mt-0">
                        <button
                          type="submit"
                          disabled={updating || !editingName.trim()}
                          title="Salvar nome"
                          aria-label="Salvar nome"
                          className="flex size-10 items-center justify-center rounded-full bg-(--primary) p-2 text-black transition hover:opacity-90 disabled:opacity-50"
                        >
                          <Check size={18} color="black" strokeWidth={3} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={updating}
                          title="Cancelar edição"
                          aria-label="Cancelar edição"
                          className="flex size-10 items-center justify-center rounded-full border border-(--border) p-2 transition hover:bg-(--background)"
                        >
                          <X size={18} color="white" strokeWidth={3} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <span className="truncate font-medium text-(--foreground)">
                      {brand.name}
                    </span>
                  )}
                </div>

                {/* Status e ações */}
                {editingId !== brand.id && (
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <div className="mr-4 flex items-center gap-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={brand.active}
                        aria-label={`Marca ${brand.name}: ${
                          brand.active ? "ativa" : "inativa"
                        }`}
                        disabled={
                          changingStatusId === brand.id ||
                          deletingId === brand.id ||
                          editingId !== null
                        }
                        onClick={() => handleToggleStatus(brand)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          brand.active ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-white transition-transform ${
                            brand.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>

                      <span
                        className={`w-16 text-sm font-medium ${
                          brand.active ? "text-green-500" : "text-(--muted)"
                        }`}
                      >
                        {changingStatusId === brand.id
                          ? "Salvando..."
                          : brand.active
                            ? "Ativa"
                            : "Inativa"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => startEditing(brand)}
                        disabled={
                          deletingId === brand.id ||
                          changingStatusId !== null ||
                          editingId !== null
                        }
                        title="Editar marca"
                        aria-label={`Editar ${brand.name}`}
                        className="size-10 rounded-full p-2 text-(--muted) transition hover:bg-(--background) hover:text-(--foreground) disabled:opacity-40"
                      >
                        <Pencil size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(brand)}
                        disabled={
                          deletingId === brand.id ||
                          changingStatusId !== null ||
                          editingId !== null
                        }
                        title="Excluir marca"
                        aria-label={`Excluir ${brand.name}`}
                        className="size-10 rounded-full p-2 text-(--muted) transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {deletingId === brand.id && (
                      <span className="text-xs text-(--muted)">
                        Excluindo...
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
