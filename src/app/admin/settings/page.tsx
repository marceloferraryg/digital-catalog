
import { connection } from "next/server";
import { redirect } from "next/navigation";

import {
  getAdminUser,
  getAdminPermissions,
} from "@/lib/supabase/auth";

import { getSiteSettings } from "@/lib/supabase/site-settings";
import SettingsManager from "@/components/admin/settings/SettingsManager";

export const instant = false;

export default async function SettingsPage() {
  await connection();

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const isMaster = admin.role === "master";

  const permissions = isMaster
    ? []
    : (await getAdminPermissions(admin.id)) ?? [];

  if (!isMaster && !permissions.includes("settings.manage")) {
    redirect("/admin");
  }

  const settings = await getSiteSettings();

  if (!settings) {
    throw new Error("Configurações da loja não encontradas.");
  }

  return (
    <SettingsManager
      initialSettings={settings}
      isMaster={isMaster}
    />
  );
}
