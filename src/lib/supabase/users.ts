import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/auth";

export type AdminPermission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type AdminUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "master" | "admin";
  active: boolean;
  created_at: string;
  permissions: AdminPermission[];
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const currentAdmin = await getAdminUser();

  if (!currentAdmin || currentAdmin.role !== "master") {
    throw new Error("Acesso não autorizado.");
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      username,
      name,
      role,
      active,
      created_at,
      admin_user_permissions (
        admin_permissions (
          id,
          code,
          name,
          description
        )
      )
    `,
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar usuários:", error.message);
    throw new Error("Não foi possível carregar os usuários.");
  }

  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (authError) {
    console.error("Erro ao buscar e-mails:", authError.message);
    throw new Error("Não foi possível carregar os e-mails dos usuários.");
  }

  const emailsById = new Map(
    authData.users.map((user) => [user.id, user.email ?? ""]),
  );

  return (data ?? []).map((user) => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: emailsById.get(user.id) ?? "",
    role: user.role,
    active: user.active,
    created_at: user.created_at,

    permissions: (user.admin_user_permissions ?? []).flatMap((item) => {
      const permission = item.admin_permissions;

      if (!permission) return [];

      return Array.isArray(permission) ? permission : [permission];
    }),
  }));
}

export async function getAdminPermissionOptions(): Promise<AdminPermission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_permissions")
    .select("id, code, name, description")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar opções de permissões:", error.message);
    throw new Error("Não foi possível carregar as permissões.");
  }

  return data ?? [];
}
