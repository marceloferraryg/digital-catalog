import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/data/products";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string | null;
  available: boolean;
  description: string | null;
  specifications: unknown;
  category: { name: string; slug: string } | null;
  brand: { name: string } | null;
  product_images: {
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
};

function normalizeSpecifications(
  value: unknown,
): { label: string; value: string }[] | undefined {
  if (Array.isArray(value)) {
    const specifications = value
      .filter(
        (item) =>
          item !== null &&
          typeof item === "object" &&
          typeof item.label === "string" &&
          typeof item.value === "string",
      )
      .map((item) => ({
        label: item.label,
        value: item.value,
      }));

    return specifications.length > 0 ? specifications : undefined;
  }

  if (value !== null && typeof value === "object") {
    const specifications = Object.entries(value).map(
      ([label, specificationValue]) => ({
        label,
        value:
          typeof specificationValue === "string" ||
          typeof specificationValue === "number" ||
          typeof specificationValue === "boolean"
            ? String(specificationValue)
            : JSON.stringify(specificationValue),
      }),
    );

    return specifications.length > 0 ? specifications : undefined;
  }

  return undefined;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      price,
      available,
      description,
      specifications,
      category:categories(name, slug),
      brand:brands(name),
      product_images(storage_path, alt_text, sort_order, is_primary)
    `,
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar produtos no Supabase:", error.message);
    throw new Error("Não foi possível carregar os produtos.");
  }

  return ((data ?? []) as unknown as ProductRow[]).map((row) => {
    const images = [...(row.product_images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }

      return a.sort_order - b.sort_order;
    });

    const gallery = images.map((image) => {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return data.publicUrl;
    });

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price === null ? null : Number(row.price),
      image: gallery[0] ?? "",
      gallery,
      category: row.category?.slug ?? "",
      brand: row.brand?.name ?? null,
      available: row.available,
      description: row.description ?? undefined,
      specifications: normalizeSpecifications(row.specifications),
    };
  });
}
