"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

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

function generateSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugPreview = useMemo(() => generateSlug(name), [name]);

  function openModal() {
    setName("");
    setSortOrder("0");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (loading) return;
    setModalOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const order = Number(sortOrder);

    if (!trimmedName) {
      setError("Informe o nome da categoria.");
      return;
    }

    if (!Number.isInteger(order) || order < 0) {
      setError("Informe uma ordem válida.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          sort_order: order,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Não foi possível cadastrar a categoria.");
        return;
      }

      setCategories((current) =>
        [...current, result.category].sort(
          (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        ),
      );

      setModalOpen(false);
      setName("");
      setSortOrder("0");

      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-(--foreground)">
              Categorias
            </h1>

            <p className="mt-2 text-sm text-(--muted)">
              Gerencie as categorias do catálogo.
            </p>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            <Plus size={18} />
            Nova categoria
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-(--border) bg-(--surface)">
          <div className="border-b border-(--border) px-5 py-4">
            <h2 className="font-semibold">
              Categorias cadastradas
              <span className="ml-2 text-sm font-normal text-(--muted)">
                ({categories.length})
              </span>
            </h2>
          </div>

          {categories.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-(--foreground)">
                Nenhuma categoria cadastrada
              </p>

              <p className="mt-2 text-sm text-(--muted)">
                Comece criando a primeira categoria do catálogo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-(--border) text-(--muted)">
                  <tr>
                    <th className="px-5 py-4 font-medium">Nome</th>
                    <th className="px-5 py-4 font-medium">Identificador</th>
                    <th className="px-5 py-4 font-medium">Ordem</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-(--border)">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-5 py-4 font-medium">{category.name}</td>

                      <td className="px-5 py-4 text-(--muted)">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4">{category.sort_order}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.active
                              ? "bg-green-500/10 text-green-500"
                              : "bg-gray-500/10 text-(--muted)"
                          }`}
                        >
                          {category.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="w-full max-w-lg rounded-xl border border-(--border) bg-(--surface) p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="category-modal-title"
                className="text-lg font-bold text-(--foreground)"
              >
                Nova categoria
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                aria-label="Fechar"
                className="rounded-lg p-2 text-(--muted) transition hover:bg-(--border) hover:text-(--foreground)"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nome da categoria
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Celulares"
                  maxLength={80}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition focus:border-(--primary)"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-medium"
                >
                  Identificador (slug)
                </label>

                <input
                  id="category-slug"
                  type="text"
                  value={slugPreview}
                  readOnly
                  placeholder="Será gerado automaticamente"
                  className="w-full cursor-not-allowed rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--muted) outline-none"
                />

                <p className="mt-2 text-xs text-(--muted)">
                  Gerado automaticamente a partir do nome.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category-order"
                  className="mb-2 block text-sm font-medium"
                >
                  Ordem de exibição
                </label>

                <input
                  id="category-order"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  required
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition focus:border-(--primary)"
                />

                <p className="mt-2 text-xs text-(--muted)">
                  Categorias com menor número aparecem primeiro.
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-lg border border-(--border) px-5 py-3 text-sm font-medium transition hover:bg-(--border) disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-(--primary) px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
