"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProductForm, {
  type ProductFormData,
} from "@/components/admin/products/ProductForm";

import type { AdminProduct } from "@/lib/supabase/products";

type SelectOption = {
  id: string;
  name: string;
};

type EditProductClientProps = {
  product: AdminProduct;
  categories: SelectOption[];
  brands: SelectOption[];
};

export default function EditProductClient({
  product,
  categories,
  brands,
}: EditProductClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: ProductFormData) {
    setIsSubmitting(true);

    try {
      const { images, removedImageIds, ...productData } = data;

      // 1. Atualiza os dados do produto.
      const updateResponse = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateResult.error || "Não foi possível atualizar o produto.",
        );
      }

      // 2. Exclui as imagens removidas do formulário.
      if (removedImageIds.length > 0) {
        const deleteResponse = await fetch(
          `/api/admin/products/${product.id}/images`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageIds: removedImageIds,
            }),
          },
        );

        const deleteResult = await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(
            deleteResult.error ||
              "Os dados foram atualizados, mas não foi possível excluir as imagens removidas.",
          );
        }
      }

      // 3. Envia as novas imagens, se houver.
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append("images", image);
        });

        const uploadResponse = await fetch(
          `/api/admin/products/${product.id}/images`,
          {
            method: "POST",
            body: formData,
          },
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.error ||
              "Os dados foram atualizados, mas não foi possível enviar as novas imagens.",
          );
        }
      }

      // 4. Volta para a listagem.
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Erro ao editar produto:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao atualizar o produto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProductForm
      categories={categories}
      brands={brands}
      existingImages={product.images}
      initialData={{
        name: product.name,
        slug: product.slug,
        category_id: product.category_id ?? "",
        brand_id: product.brand_id ?? "",
        price: product.price?.toString() ?? "",
        available: product.available,
        description: product.description ?? "",
        specifications: product.specifications ?? [],
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
