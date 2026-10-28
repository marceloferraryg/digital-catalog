"use client";

import { SetStateAction, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Rows3, Grid2x2 } from "lucide-react";

import ProductCard, { type Product } from "@/components/products/ProductCard";
import ProductFilters, {
  type ProductFiltersState,
} from "@/components/products/ProductFilters";

type ProductsCatalogProps = {
  products: Product[];
  initialCategory?: string;
};

type ProductsViewFormat = "grid" | "row";

const PRODUCTS_PER_PAGE = 20;

const VALID_CATEGORIES = ["", "celulares", "acessorios", "eletronicos"];

const INITIAL_FILTERS: ProductFiltersState = {
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "default",
};

function normalizeCategory(category: string | null | undefined) {
  const normalized = category?.toLowerCase() ?? "";

  return VALID_CATEGORIES.includes(normalized) ? normalized : "";
}

function parsePrice(value: string): number | null {
  if (value.trim() === "") return null;

  const price = Number(value);

  return Number.isFinite(price) ? price : null;
}

export default function ProductsCatalog({
  products,
  initialCategory = "",
}: ProductsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [viewProductsFormat, setViewProductsFormat] =
    useState<ProductsViewFormat>("grid");

  useEffect(() => {
    return () => {
      setCurrentPage(1);
    };
  }, []);

  const [filters, setFilters] = useState<ProductFiltersState>(() => ({
    ...INITIAL_FILTERS,
    category: normalizeCategory(initialCategory),
  }));

  // A URL é a fonte de verdade para a categoria.
  const activeCategory = normalizeCategory(searchParams.get("category"));

  // Mantém os demais filtros no estado local.
  const activeFilters = useMemo(
    () => ({
      ...filters,
      category: activeCategory,
    }),
    [filters, activeCategory],
  );

  // Obtém as marcas existentes no catálogo, sem uma lista duplicada.
  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.brand?.trim() ?? "")
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );

  function updateUrlCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleFilterChange(nextFilters: ProductFiltersState) {
    setFilters({
      ...nextFilters,
      category: normalizeCategory(nextFilters.category),
    });

    setCurrentPage(1);
    updateUrlCategory(normalizeCategory(nextFilters.category));
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
    setCurrentPage(1);
    updateUrlCategory("");
  }

  // Filtra e ordena os produtos.
  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

    const minPrice = parsePrice(activeFilters.minPrice);
    const maxPrice = parsePrice(activeFilters.maxPrice);

    let result = products.filter((product) => {
      // Busca pelo nome ou pela marca.
      if (normalizedSearch) {
        const searchableText =
          `${product.name} ${product.brand ?? ""}`.toLocaleLowerCase("pt-BR");

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      if (
        activeFilters.category &&
        product.category !== activeFilters.category
      ) {
        return false;
      }

      if (activeFilters.brand && product.brand !== activeFilters.brand) {
        return false;
      }

      // Ao filtrar por preço, produtos sem preço são excluídos.
      if (minPrice !== null || maxPrice !== null) {
        const price = product.price;

        if (price === null || price <= 0) return false;

        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
      }

      return true;
    });

    if (
      activeFilters.sort === "price-asc" ||
      activeFilters.sort === "price-desc"
    ) {
      result = [...result].sort((a, b) => {
        const priceA = a.price !== null && a.price > 0 ? a.price : null;

        const priceB = b.price !== null && b.price > 0 ? b.price : null;

        // Produtos sem preço ficam sempre no final.
        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;

        return activeFilters.sort === "price-asc"
          ? priceA - priceB
          : priceB - priceA;
      });
    }

    return result;
  }, [products, activeFilters, searchTerm]);

  const productCount = filteredProducts.length;
  const totalPages = Math.ceil(productCount / PRODUCTS_PER_PAGE);

  // Limita a página exibida sem precisar atualizar estado em um efeito.
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  function changePage(page: number) {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    document.getElementById("products-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Exibe no máximo sete números, com reticências em listas longas.
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages] as const;
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      1,
      "ellipsis-left",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "ellipsis-right",
      totalPages,
    ] as const;
  }, [totalPages, safeCurrentPage]);

  function ChangeViewProducts(format: ProductsViewFormat) {
    setViewProductsFormat(format);
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <ProductFilters
        filters={activeFilters}
        brands={brands}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      <div id="products-results" className="min-w-0 scroll-mt-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <>
            <p
              className="text-sm text-(--muted)"
              aria-live="polite"
              aria-atomic="true"
            >
              {productCount > 0
                ? `Mostrando ${startIndex + 1}–${
                    startIndex + paginatedProducts.length
                  } de ${productCount} ${
                    productCount === 1 ? "produto" : "produtos"
                  }`
                : "0 produtos encontrados"}
            </p>
          </>
          <div className="flex mr-4 justify-center items-center gap-4">
            <p className="text-md text-(--muted)">Exibir:</p>

            <button
              type="button"
              aria-label="Exibir produtos em grade"
              aria-pressed={viewProductsFormat === "grid"}
              onClick={() => ChangeViewProducts("grid")}
            >
              <Grid2x2
                size={28}
                className={
                  viewProductsFormat === "grid"
                    ? "text-(--primary)"
                    : "text-white"
                }
              />
            </button>

            <button
              type="button"
              aria-label="Exibir produtos em lista"
              aria-pressed={viewProductsFormat === "row"}
              onClick={() => ChangeViewProducts("row")}
            >
              <Rows3
                size={28}
                className={
                  viewProductsFormat === "row"
                    ? "text-(--primary)"
                    : "text-white"
                }
              />
            </button>
          </div>
        </div>

        {productCount > 0 ? (
          <>
            <div
              className={`${viewProductsFormat === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col w-full gap-4"}  
                              md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-5`}
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatView={viewProductsFormat}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Paginação dos produtos"
                className="mt-8 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => changePage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--foreground) transition-colors hover:border-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {visiblePages.map((page) => {
                  if (typeof page !== "number") {
                    return (
                      <span
                        key={page}
                        aria-hidden="true"
                        className="px-1 text-(--muted)"
                      >
                        …
                      </span>
                    );
                  }

                  const isCurrent = page === safeCurrentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => changePage(page)}
                      aria-label={`Página ${page}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                        isCurrent
                          ? "border-(--primary) bg-(--primary) text-black"
                          : "border-(--border) text-(--foreground) hover:border-(--primary)"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => changePage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--foreground) transition-colors hover:border-(--primary) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-(--border) bg-(--surface) px-4 py-12 text-center">
            <h2 className="text-lg font-semibold text-(--foreground)">
              Nenhum produto encontrado
            </h2>

            <p className="mt-2 text-sm text-(--muted)">
              Tente alterar a busca ou os filtros para encontrar outros
              produtos.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-semibold text-black"
            >
              Limpar busca e filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
