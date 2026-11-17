import type { ReactNode } from "react";
import { connection } from "next/server";

import HeaderStore from "@/components/layout/HeaderStore";
import FooterStore from "@/components/layout/Footer";

import { getSiteSettings } from "@/lib/supabase/site-settings";

export const instant = false;

export default async function LayoutStore({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();

  const settings = await getSiteSettings();

  if (!settings) {
    throw new Error("Configurações da loja não encontradas.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderStore settings={settings} />

      <main className="flex-1">{children}</main>

      <FooterStore settings={settings} />
    </div>
  );
}
