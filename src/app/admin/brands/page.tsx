import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";
import { getBrands } from "@/lib/supabase/brands";
import BrandsManager from "@/components/admin/brands/BrandsManager";

export const instant = false;

export default async function BrandsPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const isMaster = admin.role === "master";

  const permissions = isMaster
    ? []
    : ((await getAdminPermissions(admin.id)) ?? []);

  if (!isMaster && !permissions.includes("brands.view")) {
    redirect("/admin");
  }

  const brands = await getBrands();

  return (
    <BrandsManager
      initialBrands={brands}
      permissions={permissions}
      isMaster={isMaster}
    />
  );
}
