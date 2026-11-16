import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";
import { getAdminUsers, getAdminPermissionOptions } from "@/lib/supabase/users";
import UsersManager from "@/components/admin/users/UsersManager";

export const instant = false;

export default async function UsersPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin || admin.role !== "master") {
    redirect("/admin");
  }

  const [users, permissions] = await Promise.all([
    getAdminUsers(),
    getAdminPermissionOptions(),
  ]);

  return <UsersManager initialUsers={users} permissionOptions={permissions} />;
}
