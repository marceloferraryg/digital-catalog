"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: ProductFormData) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Não foi possível cadastrar o produto.",
        );
      }

      router.push("/admin/products");
      router.refresh();
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
