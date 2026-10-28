import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";
import { ChevronRight, Store } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { siteConfig } from "@/config/site";
import { getProducts } from "@/lib/supabase/products";

type ProductDetailsPageProps = {
  params: Promise<{ name: string }>;
};

function formatPrice(price: number | null) {
  if (price === null || price <= 0) return null;

  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function createWhatsAppUrl(message: string) {
  const phone = String(siteConfig.whatsappButton).replace(/\D/g, "");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

async function getProduct(name: string) {
  const products = await getProducts();

  return products.find((item) => item.slug === name);
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { name } = await params;
  const product = await getProduct(name);

  if (!product) {
    return {
      title: "Produto não encontrado | S.A Smart",
    };
  }

  const description =
    product.description ||
    `Confira ${product.name} no catálogo da S.A Smart. Consulte preço e disponibilidade diretamente com nossa equipe.`;

  return {
    title: `${product.name} | S.A Smart`,
    description,
    openGraph: {
      title: `${product.name} | S.A Smart`,
      description,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

function ProductDetailsLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <p className="text-sm text-(--muted)" role="status">
        Carregando produto...
      </p>
    </main>
  );
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  return (
    <Suspense fallback={<ProductDetailsLoading />}>
      <ProductDetailsContent params={params} />
    </Suspense>
  );
}

async function ProductDetailsContent({ params }: ProductDetailsPageProps) {
  const { name } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === name);

  if (!product) notFound();

  const formattedPrice = formatPrice(product.price);

  const whatsappMessage = product.available
    ? `Olá! Tenho interesse no produto: ${product.name}. Poderia me passar mais informações?`
    : `Olá! Gostaria de consultar a disponibilidade do produto: ${product.name}.`;

  const whatsappUrl = createWhatsAppUrl(whatsappMessage);

  const images = Array.from(
    new Set([product.image, ...(product.gallery ?? [])].filter(Boolean)),
  );

  const relatedProducts = products
    .filter(
      (item) => item.id !== product.id && item.category === product.category,
    )
    .slice(0, 4);

  return (
    <main className="container mx-auto px-2 py-4 md:px-4 md:py-8">
      <nav
        aria-label="Navegação estrutural"
        className="mb-5 flex flex-wrap items-center gap-1 text-sm text-(--muted)"
      >
        <Link href="/" className="hover:text-(--primary)">
          Início
        </Link>

        <ChevronRight size={15} aria-hidden="true" />

        <Link href="/products" className="hover:text-(--primary)">
          Produtos
        </Link>

        <ChevronRight size={15} aria-hidden="true" />

        <span aria-current="page" className="line-clamp-1 text-(--foreground)">
          {product.name}
        </span>
      </nav>

      {/* Galeria e informações do produto */}
      <section className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
        <ProductImageGallery name={product.name} images={images} />

        <div className="min-w-0 mt-4">
          {product.brand && (
            <p className="mb-2 text-sm text-(--muted)">{product.brand}</p>
          )}

          <h1 className="text-2xl font-bold leading-tight text-(--foreground) md:text-3xl">
            {product.name}
          </h1>

          <div className="my-6 border-y border-(--border) py-6">
            <p className="mb-1 text-sm text-(--muted)">
              {formattedPrice ? "Preço do produto" : "Preço"}
            </p>

            <p className="text-3xl font-bold tracking-tight text-(--foreground) md:text-4xl">
              {formattedPrice ?? "Consulte o preço"}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-full ${
                  product.available ? "bg-(--primary)" : "bg-(--muted)"
                }`}
              />

              <span
                className={`text-sm font-medium ${
                  product.available ? "text-(--primary)" : "text-(--muted)"
                }`}
              >
                {product.available
                  ? "Disponível em estoque"
                  : "Indisponível no momento"}
              </span>
            </div>
          </div>

          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${
              product.available ? "Consultar" : "Consultar disponibilidade de"
            } ${product.name} pelo WhatsApp`}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-5 py-3 font-bold text-black transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
          >
            <FaWhatsapp size={24} aria-hidden="true" color="black" />

            <span className="text-black">
              {product.available
                ? "Consultar pelo WhatsApp"
                : "Consultar disponibilidade"}
            </span>
          </Link>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-(--surface) p-4">
            <Store
              size={22}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-(--primary)"
            />

            <div>
              <p className="font-semibold text-(--foreground)">
                Atendimento direto na S.A Smart
              </p>

              <p className="mt-1 text-sm text-(--muted)">
                Tire suas dúvidas e consulte as condições de compra diretamente
                com nossa equipe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Descrição e especificações */}
      <section
        aria-labelledby="product-description-title"
        className="mt-10 grid gap-8 border-t border-(--border) pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]"
      >
        <div>
          <h2
            id="product-description-title"
            className="mb-3 text-xl font-bold text-(--foreground)"
          >
            Descrição do produto
          </h2>

          <p className="whitespace-pre-line text-sm leading-7 text-(--muted)">
            {product.description ||
              "Entre em contato com a S.A Smart para saber mais sobre este produto."}
          </p>
        </div>

        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-bold text-(--foreground)">
              Características principais
            </h2>

            <dl className="divide-y divide-(--border)">
              {product.specifications.map((specification, index) => (
                <div
                  key={`${specification.label}-${index}`}
                  className="grid grid-cols-2 gap-4 py-3 text-sm"
                >
                  <dt className="text-(--muted)">{specification.label}</dt>

                  <dd className="wrap-break-word text-(--foreground)">
                    {specification.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* Produtos relacionados */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-(--border) pt-8">
          <h2 className="mb-5 text-xl font-bold text-(--foreground)">
            Você também pode gostar
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                formatView="grid"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
