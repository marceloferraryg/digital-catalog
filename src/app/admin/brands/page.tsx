import { connection } from "next/server";
import { getBrands } from "@/lib/supabase/brands";
import BrandsManager from "@/components/admin/brands/BrandsManager";

export const instant = false;

export default async function BrandsPage() {
  await connection();

  const brands = await getBrands();

  return <BrandsManager initialBrands={brands} />;
}
