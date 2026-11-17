import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { connection } from "next/server";

import ProductsCatalog from "@/components/products/ProductsCatalog";
import { getProducts } from "@/lib/supabase/products";
import { getActiveCategories } from "@/lib/supabase/categories";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  await connection();

  const [{ category }, products, categories] = await Promise.all([
    searchParams,
    getProducts(),
    getActiveCategories(),
  ]);

  const normalizedCategory = category?.trim().toLowerCase() ?? "";

  const selectedCategory = categories.find(
    (item) => item.slug.toLowerCase() === normalizedCategory,
  );

  const validCategory = selectedCategory?.slug ?? "";
  const title = selectedCategory?.name ?? "Nossos produtos";

  const description = validCategory
    ? `Confira nossos produtos da categoria ${title.toLowerCase()}.`
    : "Confira nosso catálogo de produtos.";

  return (
    <section className="container mx-auto w-full px-4 pb-8">
      {/* Banner desktop */}
      <div className="relative mb-8 hidden w-full md:block">
        <Image
          src="/images/products/banner-desktop-v2.png"
          alt=""
          width={2172}
          height={379}
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="h-auto w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 p-8 pt-[5%] lg:pt-[5%]">
          <h1 className="mb-2 text-4xl font-bold text-(--foreground) lg:text-5xl">
            {title}
          </h1>
          <p className="text-base text-(--foreground)/90">{description}</p>
        </div>
      </div>

      {/* Banner mobile */}
      <div className="relative mb-4 md:hidden">
        <Image
          src="/images/products/banner-mobile.png"
          alt=""
          width={971}
          height={1619}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 p-8 pt-[20%]">
          <h1 className="mb-2 text-4xl font-bold text-(--foreground)">
            {title}
          </h1>
          <p className="text-sm text-(--foreground)/90">{description}</p>
        </div>
      </div>

      <nav
        aria-label="Navegação estrutural"
        className="mb-5 flex flex-wrap items-center gap-1 text-sm text-(--muted)"
      >
        <Link href="/" className="hover:text-(--primary)">
          Início
        </Link>

        <ChevronRight size={15} aria-hidden="true" />

        {validCategory ? (
          <>
            <Link href="/products" className="hover:text-(--primary)">
              Produtos
            </Link>
            <ChevronRight size={15} aria-hidden="true" />
            <span className="text-(--foreground)">{title}</span>
          </>
        ) : (
          <span className="text-(--foreground)">Produtos</span>
        )}
      </nav>

      <ProductsCatalog
        products={products}
        categories={categories}
        initialCategory={validCategory}
      />
    </section>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <section className="container mx-auto px-4 py-8">
          <p className="text-(--muted)" role="status">
            Carregando produtos...
          </p>
        </section>
      }
    >
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
