"use client";

import { useState } from "react";

import ProductForm, { type ProductFormData } from "./ProductForm";

type SelectOption = {
  id: string;
  name: string;
};

type NewProductClientProps = {
  categories: SelectOption[];
  brands: SelectOption[];
};

export default function NewProductClient({
  categories,
  brands,
}: NewProductClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: ProductFormData) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Separa as imagens dos demais dados.
      const { images, ...productData } = data;

      // Etapa 1: cadastra o produto.
      const productResponse = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const productResult = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(
          productResult.error || "Não foi possível cadastrar o produto.",
        );
      }

      const productId = productResult.product?.id;

      if (!productId) {
        throw new Error(
          "O produto foi cadastrado, mas não foi possível identificar seu ID.",
        );
      }

      // Etapa 2: envia as imagens, caso existam.
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append("images", image);
        });

        const imagesResponse = await fetch(
          `/api/admin/products/${productId}/images`,
          {
            method: "POST",
            body: formData,
          },
        );

        const imagesResult = await imagesResponse.json();

        if (!imagesResponse.ok) {
          throw new Error(
            `O produto foi cadastrado, mas houve um problema no envio das imagens: ${
              imagesResult.error || "Erro desconhecido."
            }`,
          );
        }
      }

      // Etapa 3: atualiza a listagem e redireciona.
      window.location.assign("/admin/products");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao cadastrar o produto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      <ProductForm
        categories={categories}
        brands={brands}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
