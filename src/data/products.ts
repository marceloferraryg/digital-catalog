export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  image: string;
  category: string;
  brand: string | null;
  available: boolean;
  description?: string;
  specifications?: { label: string; value: string }[];
  gallery?: string[];
};
