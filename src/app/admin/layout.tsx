import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";
import AdminShell from "@/components/admin/AdminShell";
import { connection } from "next/server";

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

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
