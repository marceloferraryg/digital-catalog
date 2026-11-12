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
    id: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  available: boolean;
  description: string | null;
  specifications: {
    label: string;
    value: string;
  }[];
  category_id: string;
  brand_id: string | null;
  category_name: string;
  brand_name: string | null;
  images: {
    id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string | null;
};

function normalizeSpecifications(
  value: unknown,
): { label: string; value: string }[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is { label: string; value: string } =>
          typeof item?.label === "string" && typeof item?.value === "string",
      )
      .map((item) => ({
        label: item.label,
        value: item.value,
      }));
  }

  return Object.entries(value)
    .filter(
      ([label, itemValue]) =>
        label.trim() !== "" && typeof itemValue === "string",
    )
    .map(([label, itemValue]) => ({
      label,
      value: itemValue,
    }));
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

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: updaters, error: updatersError },
  ] = await Promise.all([
    supabase
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
        category_id,
        brand_id,
        created_at,
        updated_at,
        updated_by,
        category:categories(name),
        brand:brands(name),
        product_images(
          id,
          storage_path,
          alt_text,
          sort_order,
          is_primary
        )
      `,
      )
      .order("created_at", { ascending: false }),

    supabase.rpc("get_product_updaters"),
  ]);

  if (productsError) {
    console.error("Erro ao buscar produtos:", productsError.message);
    throw new Error("Não foi possível carregar os produtos.");
  }

  if (updatersError) {
    console.error("Erro ao buscar responsáveis:", updatersError.message);
    throw new Error("Não foi possível carregar os responsáveis.");
  }

  const updaterMap = new Map<string, string>(
    (updaters ?? []).map(
      (user: { id: string; name: string }) => [user.id, user.name] as const,
    ),
  );

  return (products ?? []).map((row) => {
    const images = [...(row.product_images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }

      return a.sort_order - b.sort_order;
    });

    const category = Array.isArray(row.category)
      ? row.category[0]
      : row.category;

    const brand = Array.isArray(row.brand) ? row.brand[0] : row.brand;

    const formattedImages = images.map((image) => {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return {
        id: image.id,
        url: data.publicUrl,
        alt_text: image.alt_text,
        sort_order: image.sort_order,
        is_primary: image.is_primary,
      };
    });

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price === null ? null : Number(row.price),
      available: row.available,
      description: row.description,
      specifications: normalizeSpecifications(row.specifications),
      category_id: row.category_id,
      brand_id: row.brand_id,
      category_name: category?.name ?? "",
      brand_name: brand?.name ?? null,
      images: formattedImages,
      created_at: row.created_at,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      updated_by_name: row.updated_by
        ? (updaterMap.get(row.updated_by) ?? null)
        : null,
    };
  });
}

export async function getAdminProductById(
  productId: string,
): Promise<AdminProduct | null> {
  const supabase = await createClient();

  const { data: product, error } = await supabase
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
      category_id,
      brand_id,
      created_at,
      updated_at,
      updated_by,
      category:categories(name),
      brand:brands(name),
      product_images(
        id,
        storage_path,
        alt_text,
        sort_order,
        is_primary
      )
    `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar produto:", error.message);
    throw new Error("Não foi possível carregar o produto.");
  }

  if (!product) {
    return null;
  }

  const category = Array.isArray(product.category)
    ? product.category[0]
    : product.category;

  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand;

  const { data: updaters, error: updatersError } = await supabase.rpc(
    "get_product_updaters",
  );

  if (updatersError) {
    console.error("Erro ao buscar responsáveis:", updatersError.message);
    throw new Error("Não foi possível carregar os responsáveis.");
  }

  const updater = (updaters ?? []).find(
    (user: { id: string; name: string }) => user.id === product.updated_by,
  );

  const images = [...(product.product_images ?? [])]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }

      return a.sort_order - b.sort_order;
    })
    .map((image) => {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return {
        id: image.id,
        url: data.publicUrl,
        alt_text: image.alt_text,
        sort_order: image.sort_order,
        is_primary: image.is_primary,
      };
    });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price === null ? null : Number(product.price),
    available: product.available,
    description: product.description,
    specifications: normalizeSpecifications(product.specifications),
    category_id: product.category_id,
    brand_id: product.brand_id,
    category_name: category?.name ?? "",
    brand_name: brand?.name ?? null,
    images,
    created_at: product.created_at,
    updated_at: product.updated_at,
    updated_by: product.updated_by,
    updated_by_name: updater?.name ?? null,
  };
}
