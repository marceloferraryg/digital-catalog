import { Suspense } from "react";

import HeroHome from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import AssistenceHome from "@/components/home/Assistence";

import { getSiteSettings } from "@/lib/supabase/site-settings";
import { getActiveCategories } from "@/lib/supabase/categories";
import { siteConfig } from "@/config/site";

async function HomeContent() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
  ]);

  if (!settings) {
    throw new Error("Configurações da loja não encontradas.");
  }

  const whatsappButton = settings.whatsapp_button || siteConfig.whatsappButton;

  return (
    <div className="container">
      <HeroHome whatsappButton={whatsappButton} />
      <Categories categories={categories} />
      <AssistenceHome />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-96 flex items-center justify-center">
          <p className="text-(--muted)">Carregando...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
