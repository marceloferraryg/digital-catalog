"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ProductCard, { type Product } from "@/components/products/productCard";
import ProductFilters, {
  type ProductFiltersState,
} from "@/components/products/ProductFilters";

type ProductsCatalogProps = {
  products: Product[];
  initialCategory?: string;
};

const TEST_BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Marca Exemplo"];

const VALID_CATEGORIES = ["", "celulares", "acessorios", "eletronicos"];

const INITIAL_FILTERS: ProductFiltersState = {
  category: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "default",
};

export default function ProductsCatalog({
  products,
  initialCategory = "",
}: ProductsCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProductFiltersState>(() => ({
    ...INITIAL_FILTERS,
    category: VALID_CATEGORIES.includes(initialCategory) ? initialCategory : "",
  }));

  // Mantém a categoria sincronizada com a URL,
  // inclusive quando o usuário usa voltar/avançar.
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")?.toLowerCase() ?? "";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((current) => {
      if (current.category === categoryFromUrl) return current;

      return {
        ...current,
        category: VALID_CATEGORIES.includes(categoryFromUrl)
          ? categoryFromUrl
          : "",
      };
    });
  }, [searchParams]);

  function handleFilterChange(nextFilters: ProductFiltersState) {
    setFilters(nextFilters);

    const params = new URLSearchParams(searchParams.toString());

    if (nextFilters.category) {
      params.set("category", nextFilters.category);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const filteredProducts = useMemo(() => {
    const minPrice =
      filters.minPrice.trim() === "" ? null : Number(filters.minPrice);
    const maxPrice =
      filters.maxPrice.trim() === "" ? null : Number(filters.maxPrice);

    let result = products.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Produtos sem preço não entram em uma faixa de preço.
      const price = product.price;

      if (minPrice !== null || maxPrice !== null) {
        if (price === null || price <= 0) return false;
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
      }

      return true;
    });

    if (filters.sort === "price-asc") {
      result = [...result].sort((a, b) => {
        const priceA = a.price && a.price > 0 ? a.price : null;
        const priceB = b.price && b.price > 0 ? b.price : null;

        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;

        return priceA - priceB;
      });
    }

    if (filters.sort === "price-desc") {
      result = [...result].sort((a, b) => {
        const priceA = a.price && a.price > 0 ? a.price : null;
        const priceB = b.price && b.price > 0 ? b.price : null;

        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;

        return priceB - priceA;
      });
    }

    return result;
  }, [products, filters]);

  const productCount = filteredProducts.length;

  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-[280px_minmax(0,1fr)] 
                        lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8"
    >
      <ProductFilters
        filters={filters}
        brands={TEST_BRANDS}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      <div className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-(--muted)" aria-live="polite">
            {productCount}{" "}
            {productCount === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>

        {productCount > 0 ? (
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 
                            xl:grid-cols-5"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-(--border) bg-(--surface) px-4 py-12 text-center">
            <h2 className="text-lg font-semibold text-(--foreground)">
              Nenhum produto encontrado
            </h2>

            <p className="mt-2 text-sm text-(--muted)">
              Tente alterar os filtros para encontrar outros produtos.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-semibold text-black"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
