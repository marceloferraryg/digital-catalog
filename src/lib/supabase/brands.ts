import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, active, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar marcas:", error.message);
    throw new Error("Não foi possível carregar as marcas.");
  }

  return data ?? [];
}
