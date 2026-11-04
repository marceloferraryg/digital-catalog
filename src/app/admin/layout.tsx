import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";

export const instant = false;

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      {children}
    </div>
  );
}
