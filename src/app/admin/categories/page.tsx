import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";
import { getCategories } from "@/lib/supabase/categories";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export const instant = false;

export default async function CategoriesPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const isMaster = admin.role === "master";

  const permissions = isMaster
    ? []
    : ((await getAdminPermissions(admin.id)) ?? []);

  if (!isMaster && !permissions.includes("categories.view")) {
    redirect("/admin");
  }

  const categories = await getCategories();

  return (
    <CategoriesManager
      initialCategories={categories}
      permissions={permissions}
      isMaster={isMaster}
    />
  );
}
