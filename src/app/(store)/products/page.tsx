import { Suspense } from "react";

import ProductCard, { type Product } from "@/components/products/productCard";

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
    id: "1",
    name: "Smartphone Exemplo 128 GB",
    slug: "smartphone-exemplo-128gb",
    price: 1499.9,
    image: "/images/products/celular01.jpg",
    category: "celulares",
    brand: "Marca Exemplo",
    available: false,
  },
];

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;

  return (
    <section>
      <div className="container grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <section className="px-4 py-8">
          <p className="text-(--muted)">Carregando produtos...</p>
        </section>
      }
    >
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
