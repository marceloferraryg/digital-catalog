"use client";

import { useEffect, useMemo, useState } from "react";

console.log(
  "[ProductsManager] Renderizou no cliente:",
  typeof window !== "undefined",
);

import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Package,
  ImageOff,
  X,
} from "lucide-react";

import type { AdminProduct } from "@/lib/supabase/products";

type ProductsManagerProps = {
  initialProducts: AdminProduct[];
};

type ViewMode = "grid" | "list";

type AvailabilityFilter = "all" | "available" | "unavailable";

function ProductImage({
  product,
  className = "",
}: {
  product: AdminProduct;
  className?: string;
}) {
  const image = product.images[0];

  if (!image?.url) {
    return (
      <div
        className={`flex items-center justify-center bg-(--background) text-(--muted) ${className}`}
      >
        <ImageOff size={24} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-(--background) ${className}`}>
      <Image
        src={image.url}
        alt={image.alt_text || product.name}
        fill
        sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        available
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {available ? "Disponível" : "Indisponível"}
    </span>
  );
}

function formatPrice(price: number | null) {
  if (price === null) return "Sob consulta";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function formatDate(date: string) {
  if (!date) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ProductsManager({
  initialProducts,
}: ProductsManagerProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);

  console.log(
    "[ProductsManager] initialProducts:",
    initialProducts.map((p) => p.name),
  );
  console.log(
    "[ProductsManager] products state:",
    products.map((p) => p.name),
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");

  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((product) => product.category_name).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  const brands = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => product.brand_name)
            .filter((brand): brand is string => Boolean(brand)),
        ),
      ].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = search.trim().toLowerCase();

      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand_name?.toLowerCase().includes(searchTerm) ||
        product.category_name.toLowerCase().includes(searchTerm);

      const matchesCategory =
        categoryFilter === "all" || product.category_name === categoryFilter;

      const matchesBrand =
        brandFilter === "all" || product.brand_name === brandFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.available) ||
        (availabilityFilter === "unavailable" && !product.available);

      return (
        matchesSearch && matchesCategory && matchesBrand && matchesAvailability
      );
    });
  }, [products, search, categoryFilter, brandFilter, availabilityFilter]);

  const availableCount = products.filter((product) => product.available).length;

  const unavailableCount = products.length - availableCount;

  const hasFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    brandFilter !== "all" ||
    availabilityFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setBrandFilter("all");
    setAvailabilityFilter("all");
  }

  useEffect(() => {
    console.log("[ProductsManager] Executado no navegador!");
  }, []);

  return (
    <div className="mx-auto mb-8 max-w-7xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-(--foreground)">
            Produtos
          </h1>

          <p className="mt-1 text-sm text-(--muted)">
            Gerencie os produtos disponíveis no catálogo da loja.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          <Plus size={18} />
          Novo produto
        </Link>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-(--border) bg-(--surface) p-3 sm:p-4">
          <p className="text-xs text-(--muted) sm:text-sm">Total</p>

          <p className="mt-1 text-xl font-semibold text-(--foreground) sm:text-2xl">
            {products.length}
          </p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--surface) p-3 sm:p-4">
          <p className="text-xs text-(--muted) sm:text-sm">Disponíveis</p>

          <p className="mt-1 text-xl font-semibold text-emerald-500 sm:text-2xl">
            {availableCount}
          </p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--surface) p-3 sm:p-4">
          <p className="text-xs text-(--muted) sm:text-sm">Indisponíveis</p>

          <p className="mt-1 text-xl font-semibold text-red-500 sm:text-2xl">
            {unavailableCount}
          </p>
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="rounded-xl border border-(--border) bg-(--surface) p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, marca ou categoria..."
            className="h-11 w-full rounded-lg border border-(--border) bg-(--background) pl-10 pr-4 text-sm text-(--foreground) outline-none transition focus:border-(--primary)"
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 rounded-lg border border-(--border) bg-(--background) px-3 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          >
            <option value="all">Todas as categorias</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            className="h-10 rounded-lg border border-(--border) bg-(--background) px-3 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          >
            <option value="all">Todas as marcas</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value as AvailabilityFilter)
            }
            className="h-10 rounded-lg border border-(--border) bg-(--background) px-3 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          >
            <option value="all">Todas as disponibilidades</option>
            <option value="available">Disponíveis</option>
            <option value="unavailable">Indisponíveis</option>
          </select>
        </div>
      </div>

      {/* Barra de visualização */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-(--muted)">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "produto encontrado"
            : "produtos encontrados"}
        </p>

        <div className="flex items-center gap-1 rounded-lg border border-(--border) bg-(--surface) p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Visualização em grade"
            aria-pressed={viewMode === "grid"}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
              viewMode === "grid"
                ? "bg-(--primary) text-black"
                : "text-(--muted) hover:bg-(--background)"
            }`}
          >
            <LayoutGrid size={18} />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="Visualização em lista"
            aria-pressed={viewMode === "list"}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
              viewMode === "list"
                ? "bg-(--primary) text-black"
                : "text-(--muted) hover:bg-(--background)"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {filteredProducts.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-(--border) bg-(--surface) px-4 py-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-(--background) text-(--muted)">
            {products.length === 0 ? (
              <Package size={26} />
            ) : (
              <Search size={26} />
            )}
          </div>

          <h3 className="font-semibold text-(--foreground)">
            {products.length === 0
              ? "Nenhum produto cadastrado"
              : "Nenhum produto encontrado"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-(--muted)">
            {products.length === 0
              ? "Comece adicionando o primeiro produto ao catálogo da loja."
              : "Não encontramos produtos com os filtros selecionados."}
          </p>

          {products.length === 0 ? (
            <Link
              href="/admin/products/new"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-(--primary) px-4 text-sm font-semibold text-black hover:opacity-90"
            >
              <Plus size={17} />
              Cadastrar produto
            </Link>
          ) : hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-(--primary) hover:underline"
            >
              <X size={16} />
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        /* Visualização em grade */
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-xl border border-(--border) bg-(--surface) transition-colors hover:border-(--primary)/50"
            >
              <div className="relative aspect-4/3">
                <ProductImage product={product} className="h-full w-full" />

                <div className="absolute right-3 top-3">
                  <AvailabilityBadge available={product.available} />
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-2 min-h-10 font-semibold text-(--foreground)">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-(--muted)">
                    {product.brand_name || "Sem marca"}
                    {" · "}
                    {product.category_name || "Sem categoria"}
                  </p>
                </div>

                <p className="text-lg font-semibold text-(--primary)">
                  {formatPrice(product.price)}
                </p>

                <div className="border-t border-(--border) pt-3">
                  <p className="text-xs text-(--muted)">Última alteração</p>

                  <p className="mt-1 truncate text-sm text-(--foreground)">
                    {product.updated_by_name || "Não registrada"}
                  </p>

                  <p className="mt-0.5 text-xs text-(--muted)">
                    {formatDate(product.updated_at)}
                  </p>
                </div>

                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-(--border) text-sm font-medium text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
                >
                  <Pencil size={15} />
                  Editar produto
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Visualização em lista */
        <div className="overflow-hidden rounded-xl border border-(--border) bg-(--surface)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 border-collapse text-left">
              <thead>
                <tr className="border-b border-(--border) bg-(--background)">
                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Produto
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Categoria
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Marca
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Preço
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Disponibilidade
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold text-(--muted)">
                    Última alteração
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold text-(--muted)">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-(--border) last:border-0 transition hover:bg-(--background)"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          product={product}
                          className="h-12 w-12 shrink-0 rounded-lg"
                        />

                        <div className="max-w-48">
                          <p className="truncate text-sm font-medium text-(--foreground)">
                            {product.name}
                          </p>

                          <p className="truncate text-xs text-(--muted)">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-(--foreground)">
                      {product.category_name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-(--foreground)">
                      {product.brand_name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-(--foreground)">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-4 py-3">
                      <AvailabilityBadge available={product.available} />
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-(--foreground)">
                        {product.updated_by_name || "Não registrada"}
                      </p>

                      <p className="mt-0.5 text-xs text-(--muted)">
                        {formatDate(product.updated_at)}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        aria-label={`Editar ${product.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--muted) transition hover:bg-(--background) hover:text-(--primary)"
                      >
                        <Pencil size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
