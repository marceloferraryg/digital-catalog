import { NextResponse } from "next/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/supabase/auth";
import { getAdminProducts } from "@/lib/supabase/products";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  await connection();

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const products = await getAdminProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erro na API de produtos:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar os produtos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  await connection();

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const category_id = body.category_id;
    const brand_id = body.brand_id || null;
    const price =
      body.price === "" || body.price === null || body.price === undefined
        ? null
        : Number(body.price);
    const available = body.available;
    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const specifications = Array.isArray(body.specifications)
      ? Object.fromEntries(
          body.specifications
            .filter(
              (item: { label?: string; value?: string }) =>
                item.label?.trim() && item.value?.trim(),
            )
            .map((item: { label: string; value: string }) => [
              item.label.trim(),
              item.value.trim(),
            ]),
        )
      : {};

    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Informe um nome válido para o produto." },
        { status: 400 },
      );
    }

    if (!slug || slug.length > 150) {
      return NextResponse.json(
        { error: "Informe um slug válido." },
        { status: 400 },
      );
    }

    if (!category_id) {
      return NextResponse.json(
        { error: "Selecione uma categoria." },
        { status: 400 },
      );
    }

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0 || price > 99999999.99)
    ) {
      return NextResponse.json(
        { error: "Informe um preço válido." },
        { status: 400 },
      );
    }

    if (typeof available !== "boolean") {
      return NextResponse.json(
        { error: "Informe a disponibilidade do produto." },
        { status: 400 },
      );
    }

    if (description && description.length > 2000) {
      return NextResponse.json(
        { error: "A descrição deve ter no máximo 2.000 caracteres." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: permitted, error: permissionError } = await supabase.rpc(
      "has_admin_permission",
      { permission_code: "products.create" },
    );

    if (permissionError || !permitted) {
      return NextResponse.json(
        { error: "Você não tem permissão para cadastrar produtos." },
        { status: 403 },
      );
    }

    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("active", true)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        { error: "A categoria selecionada não está disponível." },
        { status: 400 },
      );
    }

    if (brand_id) {
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brand_id)
        .eq("active", true)
        .maybeSingle();

      if (!brand) {
        return NextResponse.json(
          { error: "A marca selecionada não está disponível." },
          { status: 400 },
        );
      }
    }

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json(
        { error: "Já existe um produto com esse endereço (slug)." },
        { status: 409 },
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category_id,
        brand_id,
        price,
        available,
        description,
        specifications,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao cadastrar produto:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          error: "Não foi possível cadastrar o produto.",
          details: error.message,
          code: error.code,
        },
        { status: error.code === "23505" ? 409 : 500 },
      );
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Erro na API de cadastro de produto:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao cadastrar o produto." },
      { status: 500 },
    );
  }
}
