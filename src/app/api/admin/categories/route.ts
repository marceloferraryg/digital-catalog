import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/supabase/auth";

function generateSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: listar categorias
export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, active, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error.message);

      return NextResponse.json(
        { error: "Não foi possível carregar as categorias." },
        { status: 500 },
      );
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    console.error("Erro na API de categorias:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao carregar as categorias." },
      { status: 500 },
    );
  }
}

// POST: cadastrar categoria
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const sortOrder = Number(body.sort_order ?? 0);

    if (!name) {
      return NextResponse.json(
        { error: "Informe o nome da categoria." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return NextResponse.json(
        {
          error: "A ordem deve ser um número inteiro igual ou maior que zero.",
        },
        { status: 400 },
      );
    }

    const slug = generateSlug(name);

    if (!slug) {
      return NextResponse.json(
        { error: "Não foi possível gerar um identificador válido." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        sort_order: sortOrder,
        active: true,
      })
      .select("id, name, slug, active, sort_order, created_at")
      .single();

    if (error) {
      console.error("Erro ao cadastrar categoria:", error.message);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma categoria com esse identificador." },
          { status: 409 },
        );
      }

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Você não tem permissão para cadastrar categorias." },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível cadastrar a categoria." },
        { status: 500 },
      );
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error("Erro na API de categorias:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao cadastrar a categoria." },
      { status: 500 },
    );
  }
}
