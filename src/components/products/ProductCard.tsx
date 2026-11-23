import Image from "next/image";
import Link from "next/link";

import { ImageOff } from "lucide-react";

import type { Product } from "@/data/products";

export type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
  formatView: string;
};

function formatPrice(price: number | null) {
  if (price === null || price <= 0) return null;

  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductCard({ product, formatView }: ProductCardProps) {
  const formattedPrice = formatPrice(product.price);
  const productUrl = `/products/${product.slug}`;

  return (
    <>
      {formatView === "grid" ? (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-2 border-(--border) bg-(--surface) transition-colors hover:border-(--primary)">
          <Link
            href={productUrl}
            aria-label={`Ver detalhes de ${product.name}`}
            className="relative block aspect-3/4 overflow-hidden bg-(--background)"
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 20vw"
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex flex-col gap-4 h-full w-full items-center justify-center text-sm text-(--muted)">
                <ImageOff size={48} />
                Imagem indisponível
              </div>
            )}
          </Link>

          <div className="flex flex-1 flex-col p-2 md:p-4">
            <Link href={productUrl}>
              <div className="flex h-16 w-full flex-col">
                {product.brand && (
                  <p className="mb-1 text-xs text-(--muted)">{product.brand}</p>
                )}

                <h2 className="line-clamp-2 font-semibold text-(--foreground) hover:underline">
                  {product.name}
                </h2>
              </div>

              <div className="mt-2 mb-2">
                {formattedPrice ? (
                  <p className="text-lg font-bold text-(--foreground)">
                    {formattedPrice}
                  </p>
                ) : (
                  <p className="text-sm text-(--muted)">Consulte o preço</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    product.available ? "bg-(--primary)" : "bg-(--muted)"
                  }`}
                />

                <p
                  className={`text-sm font-medium ${
                    product.available ? "text-(--primary)" : "text-(--muted)"
                  }`}
                >
                  {product.available ? "Disponível" : "Indisponível"}
                </p>
              </div>
            </Link>
          </div>
        </article>
      ) : (
        <article className="group grid w-full min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-(--border) bg-(--surface) transition-colors hover:border-(--primary) md:gap-6">
          <Link
            href={productUrl}
            aria-label={`Ver detalhes de ${product.name}`}
            className="relative flex aspect-3/4 max-h-48 w-full items-center justify-center overflow-hidden bg-(--background) md:max-h-54 lg:max-h-60"
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 767px) 40vw, 30vw"
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex flex-col gap-4 h-full w-full items-center justify-center text-sm text-(--muted)">
                <ImageOff size={48} />
                Imagem indisponível
              </div>
            )}
          </Link>

          <div className="flex flex-1 px-2 py-4 md:p-4">
            <Link href={productUrl} className="w-full">
              <div className="flex w-full flex-col">
                {product.brand && (
                  <p className="mb-1 text-sm text-(--muted)">{product.brand}</p>
                )}

                <h2 className="line-clamp-2 text-lg font-semibold text-(--foreground) hover:underline">
                  {product.name}
                </h2>
              </div>

              <div className="mt-6 mb-6">
                {formattedPrice ? (
                  <p className="text-2xl font-bold text-(--foreground)">
                    {formattedPrice}
                  </p>
                ) : (
                  <p className="text-md text-(--muted)">Consulte o preço</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    product.available ? "bg-(--primary)" : "bg-(--muted)"
                  }`}
                />

                <p
                  className={`text-sm font-medium ${
                    product.available ? "text-(--primary)" : "text-(--muted)"
                  }`}
                >
                  {product.available ? "Disponível" : "Indisponível"}
                </p>
              </div>
            </Link>
          </div>
        </article>
      )}
    </>
  );
}
