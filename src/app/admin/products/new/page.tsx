import { connection } from "next/server";

import { getActiveCategories } from "@/lib/supabase/categories";
import { getActiveBrands } from "@/lib/supabase/brands";
import NewProductClient from "@/components/admin/products/NewProductClient";

export const instant = false;

export default async function NewProductPage() {
  await connection();

  const [categories, brands] = await Promise.all([
    getActiveCategories(),
    getActiveBrands(),
  ]);

  return <NewProductClient categories={categories} brands={brands} />;
}
