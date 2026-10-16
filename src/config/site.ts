export const siteConfig = {
  // Identidade da loja
  name: "S.A Smart",
  shortName: "S.A Smart",
  description:
    "Celulares, acessórios e assistência técnica em Manoel Ribas - PR.",

  // Arquivos públicos
  logo: "/images/logo.png",
  favicon: "/favicon.ico",

  // Contato
  whatsappButton: "5543999655339",
  whatsapp: "(43) 99965-5339",
  phone: "",
  email: "",

  // Redes sociais
  socials: {
    instagram: "https://www.instagram.com/sa_smart.acessorios/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
    youtube: "https://www.youtube.com/",
  },

  // Endereço
  address: {
    street: "Av. Sete de Setembro, 1076-A",
    neighborhood: "Centro",
    city: "Manoel Ribas",
    state: "PR",
    zipCode: "85260-000",
    mapsUrl: "",
  },

  //Horário de funcionamento
  hours: {
    mondayToFriday: "Seg–Sex: 08h às 18h",
    saturday: "Sáb: 08h às 12h",
    sunday: "Dom: Fechado",
  },

  // Aparência
  theme: {
    mode: "dark" as const,
    colors: {
      background: "#090D0F",
      surface: "#141A1D",
      primary: "#B7F52B",
      foreground: "#F5F7F8",
      muted: "#9AA4AA",
      border: "#293237",
    },
  },

  // Página inicial
  home: {
    cover: "/images/home-cover.webp",
    title: "Tudo para seu celular e muito mais",
    subtitle: "Celulares, acessórios e assistência técnica em um só lugar.",
  },

  // Navegação
  navigation: {
    layout: "horizontal" as "horizontal" | "sidebar",
    showProducts: true,
    showAssistance: true,
    showContact: true,
  },

  // Funcionalidades do catálogo
  features: {
    productPrices: true,
    productAvailability: true,
    productSearch: true,
    productFilters: true,
    whatsappContact: true,
  },
};

export type SiteConfig = typeof siteConfig;
