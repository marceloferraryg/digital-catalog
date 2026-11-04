"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type Admin = {
  name: string;
  username: string;
  role: string;
};

type AdminShellProps = {
  admin: Admin;
  children: React.ReactNode;
};

export default function AdminShell({ admin, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <AdminSidebar admin={admin} open={menuOpen} onClose={closeMenu} />

      <div className="min-h-screen md:pl-64">
        <AdminHeader admin={admin} onMenuClick={() => setMenuOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
