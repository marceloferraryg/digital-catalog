"use client";

import { useState } from "react";
import Image from "next/image";

import { ImageOff } from "lucide-react";

type ProductImageGalleryProps = {
  name: string;
  images: string[];
};

export default function ProductImageGallery({
  name,
  images,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  if (!selectedImage) {
    return (
      <div className="flex flex-col gap-4 aspect-square items-center justify-center rounded-xl border border-(--border) bg-(--surface)">
        <ImageOff size={48} />
        <p className="text-sm text-(--muted)">Imagem indisponível</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-(--border) bg-(--surface)">
        <Image
          src={selectedImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-3"
          aria-label="Galeria de imagens do produto"
        >
          {images.map((image, index) => {
            const isSelected = selectedImage === image;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                aria-label={`Ver imagem ${index + 1} de ${name}`}
                aria-pressed={isSelected}
                className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-(--surface) transition-colors md:h-20 md:w-20 ${
                  isSelected
                    ? "border-(--primary) ring-2 ring-(--primary)"
                    : "border-(--border) hover:border-(--primary)"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
