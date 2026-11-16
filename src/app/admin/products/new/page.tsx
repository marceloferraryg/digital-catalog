import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";

import { getActiveCategories } from "@/lib/supabase/categories";
import { getActiveBrands } from "@/lib/supabase/brands";

import NewProductClient from "@/components/admin/products/NewProductClient";

export const instant = false;

export default async function NewProductPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const isMaster = admin.role === "master";

  const permissions = isMaster
    ? []
    : ((await getAdminPermissions(admin.id)) ?? []);

  if (!isMaster && !permissions.includes("products.create")) {
    redirect("/admin/products");
  }

  const [categories, brands] = await Promise.all([
    getActiveCategories(),
    getActiveBrands(),
  ]);

  return (
    <NewProductClient
      categories={categories}
      brands={brands}
      permissions={permissions}
      isMaster={isMaster}
    />
  );
}
