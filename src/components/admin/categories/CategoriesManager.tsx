"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Check,
  X,
  Save,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

type CategoriesManagerProps = {
  initialCategories: Category[];
};

export default function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);

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

  // Ordenação
  const [orderingMode, setOrderingMode] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<Category[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [generalError, setGeneralError] = useState("");

  const limitReached = categories.length >= 8;

  // Requisição de atualização
  async function updateCategory(
    id: string,
    updates: { name?: string; active?: boolean },
  ) {
    const response = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        id,
        ...updates,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Não foi possível atualizar a categoria.",
      );
    }

    return result.category as Category;
  }

  // Cadastrar categoria
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateError("");

    const name = newName.trim();

    if (!name) {
      setCreateError("Informe o nome da categoria.");
      return;
    }

    if (name.length > 40) {
      setCreateError("O nome pode ter no máximo 40 caracteres.");
      return;
    }

    if (limitReached) {
      setCreateError("O limite de 8 categorias já foi atingido.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/admin/categories", {
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

      setCategories((current) =>
        [...current, result.category].sort(
          (a, b) => a.sort_order - b.sort_order,
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
  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setGeneralError("");
  }

  // Salvar edição
  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    const name = editingName.trim();

    if (!name) {
      setGeneralError("Informe o nome da categoria.");
      return;
    }

    if (name.length > 40) {
      setGeneralError("O nome pode ter no máximo 40 caracteres.");
      return;
    }

    setUpdating(true);
    setGeneralError("");

    try {
      const updated = await updateCategory(editingId, { name });

      setCategories((current) =>
        current.map((category) =>
          category.id === editingId ? updated : category,
        ),
      );

      setEditingId(null);
      setEditingName("");
      router.refresh();
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a categoria.",
      );
    } finally {
      setUpdating(false);
    }
  }

  // Ativar ou desativar
  async function handleToggleStatus(category: Category) {
    setChangingStatusId(category.id);
    setGeneralError("");

    try {
      const updated = await updateCategory(category.id, {
        active: !category.active,
      });

      setCategories((current) =>
        current.map((item) => (item.id === category.id ? updated : item)),
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

  // Excluir categoria
  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a categoria "${category.name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setGeneralError("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: category.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível excluir.");
      }

      setCategories((current) =>
        current
          .filter((item) => item.id !== category.id)
          .map((item, index) => ({
            ...item,
            sort_order: index,
          })),
      );

      router.refresh();
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a categoria.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Entrar no modo de organização
  function startOrdering() {
    setOriginalOrder([...categories]);
    setOrderingMode(true);
    setOrderError("");
    setGeneralError("");
    setEditingId(null);
  }

  // Cancelar organização
  function cancelOrdering() {
    setCategories(originalOrder);
    setOrderingMode(false);
    setDraggedId(null);
    setOrderError("");
  }

  // Reorganizar posições localmente
  function moveCategory(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= categories.length || fromIndex === toIndex) {
      return;
    }

    setCategories((current) => {
      const updated = [...current];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return updated.map((category, index) => ({
        ...category,
        sort_order: index,
      }));
    });
  }

  // Arrastar e soltar
  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = categories.findIndex(
      (category) => category.id === draggedId,
    );

    const toIndex = categories.findIndex(
      (category) => category.id === targetId,
    );

    moveCategory(fromIndex, toIndex);
    setDraggedId(null);
  }

  // Salvar nova ordem no banco
  async function saveOrder() {
    setSavingOrder(true);
    setOrderError("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reorder",
          category_ids: categories.map((category) => category.id),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível salvar a ordem.");
      }

      setCategories((current) =>
        current.map((category, index) => ({
          ...category,
          sort_order: index,
        })),
      );

      setOrderingMode(false);
      setOriginalOrder([]);
      setDraggedId(null);

      router.refresh();
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a nova ordem.",
      );
    } finally {
      setSavingOrder(false);
    }
  }

  const orderChanged = categories.some(
    (category, index) => category.id !== originalOrder[index]?.id,
  );

  return (
    <div className="mx-auto max-w-7xl mb-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-(--foreground)">Categorias</h1>

          <p className="text-sm text-(--muted)">
            As categorias organizam os produtos do catálogo por grupos,
            facilitando a navegação dos clientes e a localização dos produtos.
          </p>
        </div>
      </div>

      {/* -------------------- Cadastro ---------------------*/}
      {!orderingMode && (
        <div className="mb-8 rounded-xl border border-(--border) bg-(--surface) p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Adicionar categoria</h2>

            <span
              className="w-fit rounded-full border border-(--border) px-4 py-2 
                              text-sm font-medium text-(--muted) bg-(--background)"
            >
              {categories.length} de 8 categorias
            </span>
          </div>

          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-3 sm:flex-row mb-3"
          >
            <input
              type="text"
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                setCreateError("");
              }}
              placeholder={`${categories.length === 8 ? "Limite de categorias atingido" : "Digite o nome da categoria"}`}
              maxLength={40}
              disabled={limitReached || creating}
              className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-4 py-3 
                          text-sm text-(--foreground) outline-none transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={limitReached || creating || !newName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 py-3 
                          text-sm font-semibold text-black transition hover:opacity-90 
                          disabled:cursor-not-allowed disabled:opacity-50"
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

          {limitReached && (
            <p className="text-sm text-(--muted)">
              Você atingiu o limite de 8 categorias. Exclua uma categoria para
              adicionar outra.
            </p>
          )}
        </div>
      )}

      {/* -------------------- Listagem --------------------*/}
      <div className="overflow-hidden rounded-lg border border-(--border) bg-(--surface)">
        <div
          className="flex flex-col gap-3 border-b border-(--border) px-5 py-4 
                          sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="mb-2 font-semibold">Categorias cadastradas</h2>

            {orderingMode && (
              <p className="mb-4 text-xs text-(--muted)">
                Arraste as categorias para alterar a ordem.
              </p>
            )}
          </div>

          {categories.length > 1 &&
            (orderingMode ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cancelOrdering}
                  disabled={savingOrder}
                  className="inline-flex items-center justify-center gap-2 rounded-lg 
                              border border-(--border) px-4 py-2.5 text-sm font-medium transition 
                              bg-(--background) hover:bg-(--surface-hover) disabled:opacity-50"
                >
                  <X size={16} />
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={saveOrder}
                  disabled={!orderChanged || savingOrder}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) 
                              px-8 py-2.5 text-sm font-semibold text-black transition 
                              hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingOrder ? "Salvando..." : "Salvar"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startOrdering}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--border) 
                            px-4 py-2.5 text-sm font-medium transition 
                            bg-(--background) hover:bg-(--surface-hover) disabled:opacity-50"
              >
                <ArrowUpDown size={16} />
                Organizar categorias
              </button>
            ))}
        </div>

        {generalError && (
          <div
            role="alert"
            className="border-b border-(--border) bg-red-500/10 px-5 py-3 text-sm text-red-500"
          >
            {generalError}
          </div>
        )}

        {orderError && (
          <div
            role="alert"
            className="border-b border-(--border) bg-red-500/10 px-5 py-3 text-sm text-red-500"
          >
            {orderError}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-medium text-(--foreground)">
              Nenhuma categoria cadastrada
            </p>

            <p className="mt-2 text-sm text-(--muted)">
              Comece adicionando a primeira categoria do catálogo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            {categories.map((category, index) => (
              <div
                key={category.id}
                draggable={orderingMode && !savingOrder}
                onDragStart={(event) => {
                  if (!orderingMode || savingOrder) return;

                  setDraggedId(category.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", category.id);
                }}
                onDragOver={(event) => {
                  if (orderingMode) {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(category.id);
                }}
                onDragEnd={() => setDraggedId(null)}
                className={`flex flex-col gap-3 px-5 py-4 transition sm:flex-row sm:items-center 
                              sm:justify-between ${
                                orderingMode && draggedId === category.id
                                  ? "opacity-30"
                                  : ""
                              } ${
                                orderingMode
                                  ? "bg-(--background)/40"
                                  : "hover:bg-(--background)/30"
                              }`}
              >
                {/*  --------------------Nome e alça de arraste  --------------------*/}

                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {orderingMode && (
                    <button
                      type="button"
                      aria-label={`Arrastar ${category.name}`}
                      title="Arraste para reorganizar"
                      className="cursor-grab touch-none text-(--muted) active:cursor-grabbing"
                    >
                      <GripVertical size={22} />
                    </button>
                  )}

                  {orderingMode && (
                    <span className="w-5 text-sm text-(--muted)">
                      {index + 1}.
                    </span>
                  )}

                  {editingId === category.id ? (
                    <form
                      onSubmit={handleUpdate}
                      className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        maxLength={80}
                        autoFocus
                        disabled={updating}
                        className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) 
                                    px-3 py-2 text-sm outline-none "
                      />

                      <div className="flex gap-4 items-center justify-end mt-1 sm:mt-0 sm:ml-2">
                        <button
                          type="submit"
                          disabled={updating || !editingName.trim()}
                          title="Salvar nome"
                          aria-label="Salvar nome"
                          className="rounded-full w-10 h-10 bg-(--primary) p-2 text-black transition 
                                      hover:opacity-90 disabled:opacity-50 items-center justify-center flex"
                        >
                          <Check size={18} color="black" strokeWidth={3} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={updating}
                          title="Cancelar edição"
                          aria-label="Cancelar edição"
                          className="rounded-full w-10 h-10 border border-(--border) p-2 transition 
                                      hover:bg-(--background) items-center justify-center flex"
                        >
                          <X size={18} color="white" strokeWidth={3} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <span className="truncate font-medium text-(--foreground)">
                      {category.name}
                    </span>
                  )}
                </div>

                {/*  --------------------Status e ações  --------------------*/}

                {!orderingMode && editingId !== category.id && (
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-4 mr-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={category.active}
                        aria-label={`Categoria ${category.name}: ${
                          category.active ? "ativa" : "inativa"
                        }`}
                        disabled={
                          changingStatusId === category.id ||
                          deletingId === category.id ||
                          editingId !== null
                        }
                        onClick={() => handleToggleStatus(category)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          category.active ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-white transition-transform ${
                            category.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>

                      <span
                        className={`w-16 text-sm font-medium ${
                          category.active ? "text-green-500" : "text-(--muted)"
                        }`}
                      >
                        {changingStatusId === category.id
                          ? "Salvando..."
                          : category.active
                            ? "Ativa"
                            : "Inativa"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        disabled={
                          deletingId === category.id ||
                          changingStatusId !== null ||
                          editingId !== null
                        }
                        title="Editar categoria"
                        aria-label={`Editar ${category.name}`}
                        className="rounded-full w-10 h-10 p-2 text-(--muted) transition hover:bg-(--background) hover:text-(--foreground) disabled:opacity-40"
                      >
                        <Pencil size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={
                          deletingId === category.id ||
                          changingStatusId !== null ||
                          editingId !== null
                        }
                        title="Excluir categoria"
                        aria-label={`Excluir ${category.name}`}
                        className="rounded-full w-10 h-10 p-2 text-(--muted) transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {deletingId === category.id && (
                      <span className="text-xs text-(--muted)">
                        Excluindo...
                      </span>
                    )}
                  </div>
                )}

                {/*  -------------------- Controles alternativos de ordenação  -------------------- */}
                {orderingMode && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => moveCategory(index, index - 1)}
                      disabled={index === 0 || savingOrder}
                      aria-label={`Mover ${category.name} para cima`}
                      title="Mover para cima"
                      className="rounded-lg border border-(--border) p-2 text-(--muted) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowUp size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveCategory(index, index + 1)}
                      disabled={index === categories.length - 1 || savingOrder}
                      aria-label={`Mover ${category.name} para baixo`}
                      title="Mover para baixo"
                      className="rounded-lg border border-(--border) p-2 text-(--muted) transition hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowDown size={17} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {orderingMode && (
          <div className="border-t border-(--border) px-5 py-3">
            <p className="text-xs text-(--muted)">
              A nova ordem ainda não foi salva. Arraste as categorias ou utilize
              as setas. Clique em Salvar alterações para confirmar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
