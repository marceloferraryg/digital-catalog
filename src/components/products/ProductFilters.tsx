"use client";

import { useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";

export type ProductFiltersState = {
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: "default" | "price-asc" | "price-desc";
};

type ProductFiltersProps = {
  filters: ProductFiltersState;
  brands: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onChange: (filters: ProductFiltersState) => void;
  onClear: () => void;
};

const CATEGORIES = [
  { value: "", label: "Todas as categorias" },
  { value: "celulares", label: "Celulares" },
  { value: "acessorios", label: "Acessórios" },
  { value: "eletronicos", label: "Eletrônicos" },
];

export default function ProductFilters({
  filters,
  brands,
  searchTerm,
  onSearchChange,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const searchField = (
    <div className="relative">
      <label htmlFor="product-search" className="sr-only">
        Buscar produto pelo nome
      </label>

      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
      />

      <input
        id="product-search"
        type="search"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar produto..."
        className="w-full rounded-xl border border-(--border) bg-(--surface) py-3 pl-10 pr-3 text-sm text-(--foreground) outline-none transition placeholder:text-(--muted) focus:border-(--primary)"
      />
    </div>
  );

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="filter-category"
          className="mb-2 block text-sm font-semibold text-(--foreground)"
        >
          Categoria
        </label>

        <select
          id="filter-category"
          value={filters.category}
          onChange={(event) => updateFilter("category", event.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
        >
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-brand"
          className="mb-2 block text-sm font-semibold text-(--foreground)"
        >
          Marca
        </label>

        <select
          id="filter-brand"
          value={filters.brand}
          onChange={(event) => updateFilter("brand", event.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
        >
          <option value="">Todas as marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-(--foreground)">
          Faixa de preço
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="filter-min-price"
              className="mb-1 block text-xs text-(--muted)"
            >
              Mínimo (R$)
            </label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={filters.minPrice}
              onChange={(event) => updateFilter("minPrice", event.target.value)}
              className="w-full min-w-0 rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
            />
          </div>

          <div>
            <label
              htmlFor="filter-max-price"
              className="mb-1 block text-xs text-(--muted)"
            >
              Máximo (R$)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="1.000,00"
              value={filters.maxPrice}
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              className="w-full min-w-0 rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="filter-sort"
          className="mb-2 block text-sm font-semibold text-(--foreground)"
        >
          Ordenar por preço
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(event) =>
            updateFilter(
              "sort",
              event.target.value as ProductFiltersState["sort"],
            )
          }
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) outline-none focus:border-(--primary)"
        >
          <option value="default">Padrão</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-lg border border-(--border) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:border-(--primary)"
      >
        Limpar filtros
      </button>
    </div>
  );

  return (
    <>
      {/* Busca e botão de filtros no celular */}
      <div className="mb-4 space-y-3 md:hidden">
        {searchField}

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-4 py-3 text-sm font-semibold text-(--foreground)"
          aria-expanded={mobileOpen}
          aria-controls="mobile-product-filters"
        >
          <SlidersHorizontal size={18} />
          Filtrar produtos
        </button>
      </div>

      {/* Busca e filtros no desktop */}
      <div className="hidden space-y-4 md:block">
        {searchField}

        <aside className="h-fit rounded-xl border border-(--border) bg-(--surface) p-5">
          <h2 className="mb-5 text-lg font-bold text-(--foreground)">
            Filtros
          </h2>
          {filterContent}
        </aside>
      </div>

      {/* Painel de filtros no celular */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <aside
            id="mobile-product-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 right-0 flex w-[min(88%,360px)] flex-col overflow-y-auto bg-(--surface) p-5 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="mobile-filter-title"
                className="text-lg font-bold text-(--foreground)"
              >
                Filtrar produtos
              </h2>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar filtros"
                className="rounded-lg p-2 text-(--foreground) hover:bg-(--background)"
              >
                <X size={20} />
              </button>
            </div>

            {filterContent}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-lg bg-(--primary) px-4 py-3 font-semibold text-black"
            >
              Aplicar filtros
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
