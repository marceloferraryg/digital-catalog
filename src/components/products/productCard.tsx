import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa6";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  image: string;
  category: string;
  brand: string | null;
  available: boolean;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice =
    product.price === null || product.price === 0
      ? null
      : product.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

  const message = "Olá! Tenho interesse no produto: " + product.name;

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappButton}?text=${encodeURIComponent(message)}`;

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-xl 
                        border border-(--border) bg-(--surface) transition-colors hover:border-(--primary)"
    >
      {/* Imagem do produto */}
      <div className="relative aspect-3/4 overflow-hidden bg-(--background)">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105 "
        />
      </div>

      {/* Informações do produto */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        {product.brand && (
          <p className="mb-1 text-xs text-(--muted)">{product.brand}</p>
        )}

        <h3 className="line-clamp-2 font-semibold text-(--foreground)">
          {product.name}
        </h3>

        <div className="mt-3">
          {formattedPrice ? (
            <p className="text-lg font-bold text-(--foreground)">
              {formattedPrice}
            </p>
          ) : (
            <p className="text-md text-(--muted)">Consulte o preço</p>
          )}
        </div>

        <p
          className={`mt-1 text-xs font-medium ${
            product.available ? "text-(--primary)" : "text-(--muted)"
          }`}
        >
          {product.available ? "Disponível" : "Indisponível"}
        </p>

        {/* Botão de contato */}
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar ${product.name} pelo WhatsApp`}
          className="flex items-center justify-center gap-2 rounded-lg bg-(--primary) 
                        px-3 py-2 mt-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          <FaWhatsapp size={20} color="black" />
          <span className="text-black">Consultar</span>
        </Link>
      </div>
    </article>
  );
}
