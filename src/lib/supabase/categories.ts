import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error.message);
    throw new Error("Não foi possível carregar as categorias.");
  }

  return data ?? [];
}
