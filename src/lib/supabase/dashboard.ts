import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  supabase: SupabaseClient,
  table: "products" | "categories" | "brands" | "users",
  activeColumn?: string,
  activeValue?: boolean,
) {
  let query = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

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

async function getProductsWithoutImage(supabase: SupabaseClient) {
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

async function getProductsWithoutPrice(supabase: SupabaseClient) {
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
  const supabase = await createClient();

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
    getCount(supabase, "products"),
    getCount(supabase, "products", "available", true),
    getProductsWithoutImage(supabase),
    getProductsWithoutPrice(supabase),
    getCount(supabase, "categories"),
    getCount(supabase, "categories", "active", true),
    getCount(supabase, "brands"),
    getCount(supabase, "brands", "active", true),
    includeUsers ? getCount(supabase, "users") : Promise.resolve(0),
    includeUsers
      ? getCount(supabase, "users", "active", true)
      : Promise.resolve(0),
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
