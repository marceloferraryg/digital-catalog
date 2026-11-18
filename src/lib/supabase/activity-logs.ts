import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "activated"
  | "deactivated"
  | "price_changed"
  | "availability_changed"
  | "image_added"
  | "image_removed";

export type ActivityEntity =
  | "product"
  | "category"
  | "brand"
  | "user"
  | "settings";

export type ActivityLogInput = {
  action: ActivityAction;
  entityType: ActivityEntity;
  entityId?: string | null;
  description: string;
  changes?: Record<string, unknown> | null;
};

export async function logAdminActivity({
  action,
  entityType,
  entityId = null,
  description,
  changes = null,
}: ActivityLogInput) {
  const supabase = await createClient();

  // Identifica o administrador autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Não foi possível identificar o administrador.");
  }

  // Confirma que o usuário é um administrador ativo
  const { data: admin, error: adminError } = await supabase
    .from("users")
    .select("id, active")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin || !admin.active) {
    throw new Error("Administrador não autorizado a registrar atividades.");
  }

  // Registra a atividade
  const { error } = await supabase.from("admin_activity_logs").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
    changes,
  });

  if (error) {
    console.error("Erro ao registrar atividade administrativa:", error);
    throw new Error("Não foi possível registrar a atividade administrativa.");
  }
}

export async function getRecentProductActivities(limit = 5) {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("admin_activity_logs")
    .select(
      "id, action, entity_type, entity_id, description, created_at, user_id",
    )
    .eq("entity_type", "product")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar atividades:", error);
    throw new Error("Não foi possível carregar as atividades recentes.");
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  const userIds = [...new Set(logs.map((log) => log.user_id).filter(Boolean))];

  // Busca os administradores somente quando existem IDs disponíveis
  let admins: { id: string; name: string }[] = [];

  if (userIds.length > 0) {
    const { data, error: adminsError } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);

    if (adminsError) {
      console.error("Erro ao buscar administradores:", adminsError);
      throw new Error(
        "Não foi possível carregar os responsáveis pelas atividades.",
      );
    }

    admins = data ?? [];
  }

  return logs.map((log) => ({
    ...log,
    adminName:
      admins.find((admin) => admin.id === log.user_id)?.name ?? "Administrador",
  }));
}
