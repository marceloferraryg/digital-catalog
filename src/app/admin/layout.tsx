import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminUser, getAdminPermissions } from "@/lib/supabase/auth";
import AdminShell from "@/components/admin/AdminShell";

export const instant = false;

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const permissions =
    admin.role === "master" ? [] : await getAdminPermissions(admin.id);

  return (
    <AdminShell admin={admin} permissions={permissions}>
      {children}
    </AdminShell>
  );
}
