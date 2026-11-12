import { connection } from "next/server";
import { notFound } from "next/navigation";

import { getActiveCategories } from "@/lib/supabase/categories";
import { getActiveBrands } from "@/lib/supabase/brands";
import { getAdminProductById } from "@/lib/supabase/products";

import EditProductClient from "@/components/admin/products/EditProductClient";

export const instant = false;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  await connection();

  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <EditProductClient
      product={product}
      categories={categories}
      brands={brands}
    />
  );
}
