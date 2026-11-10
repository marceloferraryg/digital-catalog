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

    if (!name || name.length > 40) {
      return NextResponse.json(
        { error: "Informe um nome válido com até 40 caracteres." },
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

    // Verifica o limite de oito categorias
    const { count, error: countError } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("Erro ao verificar categorias:", countError.message);

      return NextResponse.json(
        { error: "Não foi possível verificar o limite de categorias." },
        { status: 500 },
      );
    }

    if ((count ?? 0) >= 8) {
      return NextResponse.json(
        { error: "O limite de 8 categorias já foi atingido." },
        { status: 409 },
      );
    }

    // A nova categoria entra no final da lista
    const { data: lastCategory, error: orderError } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error("Erro ao consultar ordem:", orderError.message);

      return NextResponse.json(
        { error: "Não foi possível determinar a ordem da categoria." },
        { status: 500 },
      );
    }

    const nextOrder = (lastCategory?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        sort_order: nextOrder,
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

// PATCH: editar categoria, alterar status ou reorganizar
export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Reorganizar categorias
    if (body.action === "reorder") {
      const categoryIds = body.category_ids;

      if (
        !Array.isArray(categoryIds) ||
        categoryIds.length > 8 ||
        !categoryIds.every(
          (id: unknown) =>
            typeof id === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              id,
            ),
        ) ||
        new Set(categoryIds).size !== categoryIds.length
      ) {
        return NextResponse.json(
          { error: "A lista de categorias enviada é inválida." },
          { status: 400 },
        );
      }

      const { error } = await supabase.rpc("reorder_categories", {
        category_ids: categoryIds,
      });

      if (error) {
        console.error("Erro ao reorganizar categorias:", error.message);

        return NextResponse.json(
          { error: "Não foi possível salvar a nova ordem das categorias." },
          { status: error.code === "42501" ? 403 : 400 },
        );
      }

      return NextResponse.json({ success: true });
    }

    // Editar nome ou alterar status
    if (body.action === "update") {
      const { id, name, active } = body;

      if (typeof id !== "string") {
        return NextResponse.json(
          { error: "Categoria inválida." },
          { status: 400 },
        );
      }

      const updates: { name?: string; slug?: string; active?: boolean } = {};

      if (name !== undefined) {
        if (
          typeof name !== "string" ||
          !name.trim() ||
          name.trim().length > 40
        ) {
          return NextResponse.json(
            { error: "Informe um nome válido com até 40 caracteres." },
            { status: 400 },
          );
        }

        const newName = name.trim();
        const newSlug = generateSlug(newName);

        if (!newSlug) {
          return NextResponse.json(
            { error: "Não foi possível gerar um identificador válido." },
            { status: 400 },
          );
        }

        updates.name = newName;
        updates.slug = newSlug;
      }

      if (active !== undefined) {
        if (typeof active !== "boolean") {
          return NextResponse.json(
            { error: "Status inválido." },
            { status: 400 },
          );
        }

        updates.active = active;
      }

      if (Object.keys(updates).length === 0) {
        return NextResponse.json(
          { error: "Nenhuma alteração informada." },
          { status: 400 },
        );
      }

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select("id, name, slug, active, sort_order, created_at")
        .single();

      if (error) {
        console.error("Erro ao atualizar categoria:", error.message);

        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Já existe uma categoria com esse identificador." },
            { status: 409 },
          );
        }

        return NextResponse.json(
          { error: "Não foi possível atualizar a categoria." },
          { status: error.code === "42501" ? 403 : 400 },
        );
      }

      return NextResponse.json({ category: data });
    }

    return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de categorias:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao processar a solicitação." },
      { status: 500 },
    );
  }
}

// DELETE: excluir categoria
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id;

    if (typeof id !== "string") {
      return NextResponse.json(
        { error: "Categoria inválida." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir categoria:", error.message);

      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Esta categoria possui produtos vinculados. Remova ou transfira esses produtos antes de excluí-la.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível excluir a categoria." },
        { status: error.code === "42501" ? 403 : 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir a categoria." },
      { status: 500 },
    );
  }
}
