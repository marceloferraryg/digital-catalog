import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("users")
    .select("id, username, name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin || !admin.active) {
    return null;
  }

  return admin;
}

export async function getAdminPermissions(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_user_permissions")
    .select(
      `
      admin_permissions (
        code
      )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao buscar permissões do administrador:", error);
    return null;
  }

  return data.flatMap((item) =>
    item.admin_permissions.map((permission) => permission.code),
  );
}
