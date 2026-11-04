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
