import { connection } from "next/server";
import { getAdminProducts } from "@/lib/supabase/products";
import ProductsManager from "@/components/admin/products/ProductsManager";

export const instant = false;

export default async function ProductsPage() {
  await connection();

  const products = await getAdminProducts();

  return <ProductsManager initialProducts={products} />;
}
