import { NextResponse } from "next/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { logAdminActivity } from "@/lib/supabase/activity-logs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  await connection();

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: existingProduct, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

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

    const coreFieldsChanged =
      name !== existingProduct.name ||
      slug !== existingProduct.slug ||
      category_id !== existingProduct.category_id ||
      brand_id !== existingProduct.brand_id ||
      description !== existingProduct.description ||
      JSON.stringify(specifications) !==
        JSON.stringify(existingProduct.specifications ?? {});

    const priceChanged = price !== existingProduct.price;
    const availabilityChanged = available !== existingProduct.available;

    const checkPermission = async (permissionCode: string) => {
      const { data, error } = await supabase.rpc("has_admin_permission", {
        permission_code: permissionCode,
      });

      return !error && data === true;
    };

    if (coreFieldsChanged) {
      const permitted = await checkPermission("products.edit");

      if (!permitted) {
        return NextResponse.json(
          { error: "Você não tem permissão para editar os dados do produto." },
          { status: 403 },
        );
      }
    }

    if (priceChanged) {
      const permitted = await checkPermission("products.price");

      if (!permitted) {
        return NextResponse.json(
          { error: "Você não tem permissão para alterar o preço." },
          { status: 403 },
        );
      }
    }

    if (availabilityChanged) {
      const permitted = await checkPermission("products.availability");

      if (!permitted) {
        return NextResponse.json(
          { error: "Você não tem permissão para alterar a disponibilidade." },
          { status: 403 },
        );
      }
    }

    if (coreFieldsChanged) {
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

      const { data: duplicate } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          { error: "Já existe outro produto com esse endereço (slug)." },
          { status: 409 },
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    };

    if (coreFieldsChanged) {
      Object.assign(updateData, {
        name,
        slug,
        category_id,
        brand_id,
        description,
        specifications,
      });
    }

    if (priceChanged) {
      updateData.price = price;
    }

    if (availabilityChanged) {
      updateData.available = available;
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar produto:", error);

      return NextResponse.json(
        { error: "Não foi possível atualizar o produto." },
        { status: error.code === "23505" ? 409 : 500 },
      );
    }

    // Registra as alterações realizadas no produto
    const changes: Record<string, unknown> = {};

    if (coreFieldsChanged) {
      const fields = [
        "name",
        "slug",
        "category_id",
        "brand_id",
        "description",
        "specifications",
      ] as const;

      for (const field of fields) {
        if (
          JSON.stringify(existingProduct[field]) !==
          JSON.stringify(product[field])
        ) {
          changes[field] = {
            old: existingProduct[field],
            new: product[field],
          };
        }
      }
    }

    if (priceChanged) {
      changes.price = {
        old: existingProduct.price,
        new: product.price,
      };
    }

    if (availabilityChanged) {
      changes.available = {
        old: existingProduct.available,
        new: product.available,
      };
    }

    if (Object.keys(changes).length > 0) {
      const action =
        priceChanged && !coreFieldsChanged && !availabilityChanged
          ? "price_changed"
          : availabilityChanged && !coreFieldsChanged && !priceChanged
            ? "availability_changed"
            : "updated";

      await logAdminActivity({
        action,
        entityType: "product",
        entityId: product.id,
        description: `Atualizou o produto ${product.name}`,
        changes,
      });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/products/[name]", "page");

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Erro na API de atualização:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o produto." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  await connection();

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: permitted, error: permissionError } = await supabase.rpc(
      "has_admin_permission",
      {
        permission_code: "products.delete",
      },
    );

    if (permissionError || !permitted) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir produtos." },
        { status: 403 },
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        ` id,
          name,
          slug,
          price,
          category_id,
          brand_id
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", id);

    if (imagesError) {
      console.error("Erro ao buscar imagens do produto:", imagesError);

      return NextResponse.json(
        { error: "Não foi possível localizar as imagens do produto." },
        { status: 500 },
      );
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erro ao excluir produto:", deleteError);

      if (deleteError.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Não foi possível excluir este produto porque existem outros registros vinculados a ele.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Não foi possível excluir o produto." },
        { status: 500 },
      );
    }

    await logAdminActivity({
      action: "deleted",
      entityType: "product",
      entityId: product.id,
      description: `Excluiu o produto ${product.name}`,
      changes: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        category_id: product.category_id,
        brand_id: product.brand_id,
        images_count: images?.length ?? 0,
      },
    });

    const storagePaths = (images ?? [])
      .map((image) => image.storage_path)
      .filter((path): path is string => Boolean(path));

    let storageWarning: string | null = null;

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove(storagePaths);

      if (storageError) {
        console.error(
          "Produto excluído, mas houve erro ao remover imagens do Storage:",
          storageError,
        );

        storageWarning =
          "O produto foi excluído, mas não foi possível remover todos os arquivos de imagem do Storage.";
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/products/[name]", "page");

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso.",
      storageWarning,
    });
  } catch (error) {
    console.error("Erro na API de exclusão de produto:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir o produto." },
      { status: 500 },
    );
  }
}
