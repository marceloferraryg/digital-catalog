import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Category } from "@/lib/supabase/categories";

type CategoriesProps = {
  categories: Category[];
};

const CATEGORY_COLORS = [
  "#263D35",
  "#263B50",
  "#403653",
  "#354653",
  "#34494A",
  "#3D4555",
  "#3D493F",
  "#454052",
];

function getCategoryColor(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

export default function Categories({ categories }: CategoriesProps) {
  const visibleCategories = categories.slice(0, 8);

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 p-4 lg:p-8">
      <div>
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl font-bold text-(--foreground) lg:text-3xl">
            Explore nossos produtos
          </h2>
        </div>

        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {visibleCategories.map((category) => {
            const color = getCategoryColor(category.id);

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                style={{ backgroundColor: color }}
                className="group flex min-h-20 items-center justify-between gap-3 rounded-xl border border-white/5 p-4 transition-all duration-300 hover:border-(--primary) hover:brightness-110 md:min-h-32 md:items-start md:p-4 lg:min-h-40 lg:flex-col lg:justify-between lg:p-5"
              >
                <h3 className="text-2xl font-semibold text-white md:text-lg lg:text-xl">
                  {category.name}
                </h3>

                <ArrowUpRight
                  size={22}
                  className="shrink-0 text-white/80 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
