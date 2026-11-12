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

    // Verifica permissão para gerenciar imagens.
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

    // Confirma que o produto existe.
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

    // Recebe as imagens.
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

    // Verifica quantas imagens o produto já possui.
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

    // Valida todos os arquivos antes de iniciar o upload.
    for (const file of files) {
      if (!ALLOWED_TYPES[file.type]) {
        return NextResponse.json(
          {
            error: `Formato não permitido: ${file.name}.`,
          },
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

    // Envia os arquivos e prepara os registros.
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

    // Registra as imagens na tabela.
    const { data: savedImages, error: insertError } = await supabase
      .from("product_images")
      .insert(records)
      .select();

    if (insertError) {
      throw insertError;
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/[name]`, "page");

    return NextResponse.json(
      {
        message: "Imagens enviadas com sucesso.",
        images: savedImages,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no upload das imagens:", error);

    // Se o banco falhar, tenta remover os arquivos enviados.
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
