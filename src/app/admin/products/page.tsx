import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";
import { getAdminProducts } from "@/lib/supabase/products";
import ProductsManager from "@/components/admin/products/ProductsManager";

export const instant = false;

export default async function ProductsPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const isMaster = admin.role === "master";

  const permissions = isMaster ? [] : await getAdminPermissions(admin.id);

  if (!isMaster && (!permissions || !permissions.includes("products.view"))) {
    redirect("/admin");
  }

  const products = await getAdminProducts();

  return (
    <ProductsManager
      initialProducts={products}
      permissions={permissions ?? []}
      isMaster={isMaster}
    />
  );
}
