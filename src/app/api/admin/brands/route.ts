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

// GET: listar marcas
export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, active, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar marcas:", error.message);

      return NextResponse.json(
        { error: "Não foi possível carregar as marcas." },
        { status: 500 },
      );
    }

    return NextResponse.json({ brands: data ?? [] });
  } catch (error) {
    console.error("Erro na API de marcas:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao carregar as marcas." },
      { status: 500 },
    );
  }
}

// POST: cadastrar marca
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: "Informe um nome válido com até 80 caracteres." },
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
      .from("brands")
      .insert({
        name,
        slug,
        active: true,
      })
      .select("id, name, slug, active, created_at")
      .single();

    if (error) {
      console.error("Erro ao cadastrar marca:", error.message);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma marca com esse identificador." },
          { status: 409 },
        );
      }

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Você não tem permissão para cadastrar marcas." },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível cadastrar a marca." },
        { status: 500 },
      );
    }

    return NextResponse.json({ brand: data }, { status: 201 });
  } catch (error) {
    console.error("Erro na API de marcas:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao cadastrar a marca." },
      { status: 500 },
    );
  }
}

// PATCH: editar nome ou alterar status
export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, active } = body;

    if (typeof id !== "string") {
      return NextResponse.json({ error: "Marca inválida." }, { status: 400 });
    }

    const updates: {
      name?: string;
      slug?: string;
      active?: boolean;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
        return NextResponse.json(
          { error: "Informe um nome válido com até 80 caracteres." },
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

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brands")
      .update(updates)
      .eq("id", id)
      .select("id, name, slug, active, created_at")
      .single();

    if (error) {
      console.error("Erro ao atualizar marca:", error.message);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma marca com esse identificador." },
          { status: 409 },
        );
      }

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Você não tem permissão para alterar marcas." },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível atualizar a marca." },
        { status: 500 },
      );
    }

    return NextResponse.json({ brand: data });
  } catch (error) {
    console.error("Erro na API de marcas:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar a marca." },
      { status: 500 },
    );
  }
}

// DELETE: excluir marca
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id;

    if (typeof id !== "string") {
      return NextResponse.json({ error: "Marca inválida." }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir marca:", error.message);

      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Esta marca possui produtos vinculados. Remova ou transfira esses produtos antes de excluí-la.",
          },
          { status: 409 },
        );
      }

      if (error.code === "42501") {
        return NextResponse.json(
          { error: "Você não tem permissão para excluir marcas." },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível excluir a marca." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na API de marcas:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir a marca." },
      { status: 500 },
    );
  }
}
