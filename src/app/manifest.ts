import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "S.A Smart | Catálogo",
    short_name: "S.A Smart",
    description: "Celulares, acessórios e assistência técnica.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#090D0F",
    theme_color: "#B7F52B",
    icons: [
      {
        src: "/icons/logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
