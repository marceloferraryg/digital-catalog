import { connection } from "next/server";
import { getCategories } from "@/lib/supabase/categories";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export const instant = false;

export default async function CategoriesPage() {
  await connection();

  const categories = await getCategories();

  return <CategoriesManager initialCategories={categories} />;
}
