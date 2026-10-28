import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Celulares",
    description: "Encontre seu próximo smartphone.",
    image: "/images/home/categories/celulares.png",
    href: "/products?category=celulares",
  },
  {
    title: "Acessórios",
    description: "Tudo para proteger e complementar seu celular.",
    image: "/images/home/categories/acessorios.png",
    href: "/products?category=acessorios",
  },
  {
    title: "Eletrônicos",
    description: "Tecnologia para facilitar seu dia a dia.",
    image: "/images/home/categories/eletronicos.png",
    href: "/products?category=eletronicos",
  },
  {
    title: "Assistência técnica",
    description: "Cuidado e manutenção para seu aparelho.",
    image: "/images/home/categories/assistencia.png",
    href: "/assistence",
  },
];

export default function Categories() {
  return (
    <section className="p-4 lg:p-8 mb-8">
      <div className="">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-(--foreground) lg:text-3xl">
            Explore nossas categorias
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group overflow-hidden rounded-xl border border-(--border) bg-(--surface) transition-colors 
                            hover:border-(--primary)"
            >
              <div className="relative aspect-5/3 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 1023px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between gap-2 p-3 lg:p-4">
                <div>
                  <h2 className="font-semibold text-(--foreground) text-md md:text-xl lg:text-2xl">
                    {category.title}
                  </h2>
                  <p className="mt-1 hidden text-sm text-(--muted) md:block">
                    {category.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={20}
                  className="shrink-0 text-(--primary) transition-transform group-hover:translate-x-1 
                                group-hover:-translate-y-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
