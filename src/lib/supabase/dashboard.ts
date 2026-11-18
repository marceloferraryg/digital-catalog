import "server-only";

import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  products: {
    total: number;
    available: number;
    unavailable: number;
    withoutImage: number;
    withoutPrice: number;
  };
  categories: {
    total: number;
    active: number;
  };
  brands: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    active: number;
  };
};

async function getCount(
  table: "products" | "categories" | "brands" | "users",
  activeColumn?: string,
  activeValue?: boolean,
) {
  const supabase = await createClient();

  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (activeColumn && activeValue !== undefined) {
    query = query.eq(activeColumn, activeValue);
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Erro ao contar registros de ${table}:`, error.message);
    throw new Error("Não foi possível carregar os indicadores do dashboard.");
  }

  return count ?? 0;
}

async function getProductsWithoutImage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, product_images(id)");

  if (error) {
    console.error("Erro ao verificar imagens dos produtos:", error.message);
    throw new Error("Não foi possível verificar as imagens dos produtos.");
  }

  return (data ?? []).filter(
    (product) => !product.product_images || product.product_images.length === 0,
  ).length;
}

async function getProductsWithoutPrice() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("price", null);

  if (error) {
    console.error("Erro ao verificar preços dos produtos:", error.message);
    throw new Error("Não foi possível verificar os preços dos produtos.");
  }

  return count ?? 0;
}

export async function getDashboardStats(
  includeUsers: boolean,
): Promise<DashboardStats> {
  const [
    productsTotal,
    productsAvailable,
    productsWithoutImage,
    productsWithoutPrice,
    categoriesTotal,
    categoriesActive,
    brandsTotal,
    brandsActive,
    usersTotal,
    usersActive,
  ] = await Promise.all([
    getCount("products"),
    getCount("products", "available", true),
    getProductsWithoutImage(),
    getProductsWithoutPrice(),
    getCount("categories"),
    getCount("categories", "active", true),
    getCount("brands"),
    getCount("brands", "active", true),
    includeUsers ? getCount("users") : Promise.resolve(0),
    includeUsers ? getCount("users", "active", true) : Promise.resolve(0),
  ]);

  return {
    products: {
      total: productsTotal,
      available: productsAvailable,
      unavailable: productsTotal - productsAvailable,
      withoutImage: productsWithoutImage,
      withoutPrice: productsWithoutPrice,
    },
    categories: {
      total: categoriesTotal,
      active: categoriesActive,
    },
    brands: {
      total: brandsTotal,
      active: brandsActive,
    },
    users: {
      total: usersTotal,
      active: usersActive,
    },
  };
}
