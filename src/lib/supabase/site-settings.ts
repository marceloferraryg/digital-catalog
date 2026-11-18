import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteSettings = {
  id: string;
  name: string;
  description: string | null;
  whatsapp_button: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  address: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    mapsUrl?: string;
  };
  hours: {
    mondayToFriday?: string;
    saturday?: string;
    sunday?: string;
  };
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  updated_at: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar configurações:", error.message);
    throw new Error("Não foi possível carregar as configurações.");
  }

  return data;
}

export async function updateSiteSettings(
  settings: Partial<Omit<SiteSettings, "id" | "updated_at">>,
): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .single();

  if (fetchError || !current) {
    console.error("Erro ao localizar configurações:", fetchError?.message);
    throw new Error("Configurações não encontradas.");
  }

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao atualizar configurações:", error.message);
    throw new Error("Não foi possível atualizar as configurações.");
  }

  return data;
}
