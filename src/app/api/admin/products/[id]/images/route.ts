import { NextResponse } from "next/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/supabase/auth";

const BUCKET = "product-images";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ======================================================
// POST - Enviar imagens
// ======================================================

export async function POST(request: Request, { params }: RouteContext) {
  await connection();

  const uploadedPaths: string[] = [];

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: productId } = await params;
    const supabase = await createClient();

    const { data: permitted, error: permissionError } = await supabase.rpc(
      "has_admin_permission",
      {
        permission_code: "products.images",
      },
    );

    if (permissionError || !permitted) {
      return NextResponse.json(
        { error: "Você não tem permissão para gerenciar imagens." },
        { status: 403 },
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const entries = formData.getAll("images");

    const files = entries.filter(
      (entry): entry is File => entry instanceof File,
    );

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Selecione pelo menos uma imagem." },
        { status: 400 },
      );
    }

    const { data: existingImages, error: imagesError } = await supabase
      .from("product_images")
      .select("id, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (imagesError) {
      throw imagesError;
    }

    const currentCount = existingImages?.length ?? 0;

    if (currentCount + files.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          error: `O produto pode ter no máximo ${MAX_IMAGES} imagens.`,
        },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES[file.type]) {
        return NextResponse.json(
          { error: `Formato não permitido: ${file.name}.` },
          { status: 400 },
        );
      }

      if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            error: `A imagem ${file.name} está vazia ou ultrapassa 5 MB.`,
          },
          { status: 400 },
        );
      }
    }

    const records = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const extension = ALLOWED_TYPES[file.type];

      const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      uploadedPaths.push(storagePath);

      records.push({
        product_id: productId,
        storage_path: storagePath,
        alt_text: file.name,
        sort_order: currentCount + index,
        is_primary: currentCount === 0 && index === 0,
      });
    }

    const { data: savedImages, error: insertError } = await supabase
      .from("product_images")
      .insert(records)
      .select();

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/products/[name]", "page");

    return NextResponse.json(
      {
        message: "Imagens enviadas com sucesso.",
        images: savedImages,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no upload das imagens:", error);

    if (uploadedPaths.length > 0) {
      try {
        const supabase = await createClient();

        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("Erro ao limpar arquivos do Storage:", cleanupError);
        }
      } catch (cleanupError) {
        console.error("Falha na limpeza dos arquivos:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "Não foi possível enviar as imagens do produto." },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE - Excluir imagens
// ======================================================

export async function DELETE(request: Request, { params }: RouteContext) {
  await connection();

  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: productId } = await params;
    const supabase = await createClient();

    // Verifica permissão.
    const { data: permitted, error: permissionError } = await supabase.rpc(
      "has_admin_permission",
      {
        permission_code: "products.images",
      },
    );

    if (permissionError || !permitted) {
      return NextResponse.json(
        { error: "Você não tem permissão para gerenciar imagens." },
        { status: 403 },
      );
    }

    // Recebe os IDs das imagens que serão excluídas.
    const body = await request.json();
    const imageIds = body.imageIds;

    if (
      !Array.isArray(imageIds) ||
      imageIds.length === 0 ||
      !imageIds.every(
        (id: unknown) =>
          typeof id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            id,
          ),
      )
    ) {
      return NextResponse.json(
        { error: "IDs de imagens inválidos." },
        { status: 400 },
      );
    }

    const uniqueImageIds = [...new Set(imageIds)];

    // Busca somente imagens pertencentes ao produto.
    const { data: imagesToDelete, error: imagesError } = await supabase
      .from("product_images")
      .select("id, storage_path, is_primary")
      .eq("product_id", productId)
      .in("id", uniqueImageIds);

    if (imagesError) {
      throw imagesError;
    }

    if (!imagesToDelete || imagesToDelete.length !== uniqueImageIds.length) {
      return NextResponse.json(
        {
          error: "Uma ou mais imagens não foram encontradas neste produto.",
        },
        { status: 404 },
      );
    }

    const deletingPrimary = imagesToDelete.some((image) => image.is_primary);

    // Exclui os registros do banco.
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .in("id", uniqueImageIds);

    if (deleteError) {
      throw deleteError;
    }

    // Remove os arquivos do Storage.
    const storagePaths = imagesToDelete.map((image) => image.storage_path);

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error("Erro ao remover arquivos do Storage:", storageError);
    }

    // Se a capa foi removida, promove a primeira imagem restante.
    if (deletingPrimary) {
      const { data: remainingImages, error: remainingError } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true })
        .limit(1);

      if (remainingError) {
        throw remainingError;
      }

      if (remainingImages && remainingImages.length > 0) {
        const { error: primaryError } = await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", remainingImages[0].id)
          .eq("product_id", productId);

        if (primaryError) {
          throw primaryError;
        }
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/products");
    revalidatePath("/products/[name]", "page");

    return NextResponse.json({
      message: storageError
        ? "Imagens excluídas do cadastro, mas houve um problema ao remover alguns arquivos do Storage."
        : "Imagens excluídas com sucesso.",
      warning: storageError
        ? "Alguns arquivos podem permanecer no Storage."
        : null,
    });
  } catch (error) {
    console.error("Erro ao excluir imagens:", error);

    return NextResponse.json(
      { error: "Não foi possível excluir as imagens do produto." },
      { status: 500 },
    );
  }
}
