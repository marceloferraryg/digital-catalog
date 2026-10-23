import { Suspense } from "react";

import ProductsCatalog from "@/components/products/ProductsCatalog";
import { Product } from "@/components/products/productCard";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Smartphone Exemplo 128 GB",
    slug: "smartphone-exemplo-128gb",
    price: 1499.9,
    image: "/images/products/celular01.jpg",
    category: "celulares",
    brand: "Marca Exemplo",
    available: true,
  },
  {
    id: "2",
    name: "Smartphone Exemplo 128 GB",
    slug: "smartphone-exemplo-128gb-eletronicos",
    price: 399.9,
    image: "/images/products/celular03.png",
    category: "eletronicos",
    brand: "Samsung",
    available: false,
  },
  {
    id: "3",
    name: "Smartphone Exemplo 128 GB",
    slug: "smartphone-exemplo-128gb-acessorios",
    price: 3499.9,
    image: "/images/products/celular02.webp",
    category: "acessorios",
    brand: "Xiaomi",
    available: false,
  },
  {
    id: "4",
    name: "Smartphone Exemplo",
    slug: "smartphone-exemplo-consulte-preco",
    price: 0,
    image: "/images/products/celular04.avif",
    category: "celulares",
    brand: "Motorola",
    available: true,
  },
  {
    id: "5",
    name: "Smartphone Exemplo 128 GB camera 64px preto",
    slug: "smartphone-exemplo-128gb-camera-64px-preto",
    price: 1239.45,
    image: "/images/products/celular05.avif",
    category: "celulares",
    brand: "Apple",
    available: true,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  celulares: "Celulares",
  acessorios: "Acessórios",
  eletronicos: "Eletrônicos",
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const normalizedCategory = category?.toLowerCase() ?? "";

  const validCategory = Object.hasOwn(CATEGORY_LABELS, normalizedCategory)
    ? normalizedCategory
    : "";

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-(--foreground) md:text-3xl">
          {CATEGORY_LABELS[validCategory] ?? "Nossos produtos"}
        </h1>

        <p className="text-sm text-(--muted) md:text-base">
          {validCategory
            ? `Confira nossos ${CATEGORY_LABELS[validCategory].toLowerCase()}.`
            : "Confira nossos celulares, acessórios e eletrônicos."}
        </p>
      </div>

      <ProductsCatalog products={PRODUCTS} initialCategory={validCategory} />
    </section>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <section className="container mx-auto px-4 py-8">
          <p className="text-(--muted)">Carregando produtos...</p>
        </section>
      }
    >
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
