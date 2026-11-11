"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ImagePlus } from "lucide-react";

export type ProductFormData = {
  name: string;
  slug: string;
  category_id: string;
  brand_id: string;
  price: string;
  available: boolean;
  description: string;
  specifications: {
    label: string;
    value: string;
  }[];
};

type SelectOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: SelectOption[];
  brands: SelectOption[];
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
};

function generateSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductForm({
  categories,
  brands,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");

  const [brandId, setBrandId] = useState(initialData?.brand_id ?? "");

  const [price, setPrice] = useState(initialData?.price ?? "");
  const [available, setAvailable] = useState(initialData?.available ?? true);

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [specifications, setSpecifications] = useState<
    { label: string; value: string }[]
  >(initialData?.specifications ?? []);

  function handleNameChange(value: string) {
    setName(value);

    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugManuallyEdited(true);
  }

  function addSpecification() {
    setSpecifications((current) => [...current, { label: "", value: "" }]);
  }

  function updateSpecification(
    index: number,
    field: "label" | "value",
    value: string,
  ) {
    setSpecifications((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function removeSpecification(index: number) {
    setSpecifications((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      brand_id: brandId,
      price,
      available,
      description: description.trim(),
      specifications: specifications.filter(
        (item) => item.label.trim() && item.value.trim(),
      ),
    });
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-(--border) bg-(--background) px-3 text-sm text-(--foreground) outline-none transition focus:border-(--primary)";

  const labelClass = "mb-1.5 block text-sm font-medium text-(--foreground)";

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-8 max-w-7xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="mb-3 inline-flex items-center gap-2 text-sm text-(--muted) transition hover:text-(--primary)"
          >
            <ArrowLeft size={16} />
            Voltar para produtos
          </Link>

          <h1 className="text-2xl font-semibold text-(--foreground)">
            {initialData ? "Editar produto" : "Novo produto"}
          </h1>

          <p className="mt-1 text-sm text-(--muted)">
            Preencha as informações para cadastrar o produto no catálogo.
          </p>
        </div>
      </div>

      {/* Informações básicas */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-(--foreground)">
            Informações básicas
          </h2>
          <p className="mt-1 text-sm text-(--muted)">
            Identificação e classificação do produto.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="product-name" className={labelClass}>
              Nome do produto *
            </label>

            <input
              id="product-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Ex.: Capa Silicone iPhone 17 Pro"
              maxLength={120}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="product-slug" className={labelClass}>
              Slug *
            </label>

            <input
              id="product-slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="capa-silicone-iphone-17-pro"
              maxLength={150}
              required
              className={inputClass}
            />

            <p className="mt-1.5 text-xs text-(--muted)">
              Utilizada para identificar o produto na URL pública.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-category" className={labelClass}>
                Categoria *
              </label>

              <select
                id="product-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">Selecione uma categoria</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-brand" className={labelClass}>
                Marca
              </label>

              <select
                id="product-brand"
                value={brandId}
                onChange={(event) => setBrandId(event.target.value)}
                className={inputClass}
              >
                <option value="">Sem marca</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Preço e disponibilidade */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-(--foreground)">
            Preço e disponibilidade
          </h2>

          <p className="mt-1 text-sm text-(--muted)">
            Defina o valor e a situação atual do produto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="product-price" className={labelClass}>
              Preço (R$)
            </label>

            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              className={inputClass}
            />

            <p className="mt-1.5 text-xs text-(--muted)">
              Deixe vazio caso o preço seja informado sob consulta.
            </p>
          </div>

          <div>
            <span className={labelClass}>Disponibilidade</span>

            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((current) => !current)}
              className="flex h-11 w-full items-center justify-between rounded-lg border border-(--border) bg-(--background) px-3"
            >
              <span className="text-sm text-(--foreground)">
                {available ? "Produto disponível" : "Produto indisponível"}
              </span>

              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  available ? "bg-(--primary)" : "bg-(--border)"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    available ? "left-6" : "left-1"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Descrição */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-(--foreground)">Descrição</h2>

          <p className="mt-1 text-sm text-(--muted)">
            Apresente as características e os detalhes do produto.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descreva o produto..."
          rows={5}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-(--border) bg-(--background) p-3 text-sm text-(--foreground) outline-none transition placeholder:text-(--muted) focus:border-(--primary)"
        />

        <p className="mt-1.5 text-right text-xs text-(--muted)">
          {description.length}/2000 caracteres
        </p>
      </section>

      {/* Especificações */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-(--foreground)">
              Especificações
            </h2>

            <p className="mt-1 text-sm text-(--muted)">
              Adicione características técnicas do produto.
            </p>
          </div>

          <button
            type="button"
            onClick={addSpecification}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-(--border) px-3 text-sm font-medium text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            <Plus size={16} />
            Adicionar especificação
          </button>
        </div>

        {specifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-(--border) px-4 py-8 text-center">
            <p className="text-sm text-(--muted)">
              Nenhuma especificação adicionada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {specifications.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  value={item.label}
                  onChange={(event) =>
                    updateSpecification(index, "label", event.target.value)
                  }
                  placeholder="Ex.: Material"
                  aria-label="Nome da especificação"
                  className={inputClass}
                />

                <input
                  value={item.value}
                  onChange={(event) =>
                    updateSpecification(index, "value", event.target.value)
                  }
                  placeholder="Ex.: Silicone"
                  aria-label="Valor da especificação"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  aria-label="Remover especificação"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-(--muted) transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Imagens - integração será feita na próxima etapa */}
      <section className="rounded-xl border border-(--border) bg-(--surface) p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-(--foreground)">
            Imagens do produto
          </h2>

          <p className="mt-1 text-sm text-(--muted)">
            Adicione fotos para apresentar o produto no catálogo.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-(--border) bg-(--background) px-4 py-10 text-center">
          <ImagePlus size={30} className="text-(--muted)" />

          <p className="mt-3 text-sm font-medium text-(--foreground)">
            Gerenciamento de imagens
          </p>

          <p className="mt-1 text-xs text-(--muted)">
            A seleção, visualização e organização das fotos serão implementadas
            na próxima etapa.
          </p>
        </div>
      </section>

      {/* Ações */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-(--border) px-5 text-sm font-medium text-(--foreground) transition hover:bg-(--surface)"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </form>
  );
}
