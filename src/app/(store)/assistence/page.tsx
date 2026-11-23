import { Suspense } from "react";
import { connection } from "next/server";
import HeroAssistence from "@/components/assistence/Hero";
import AssistenceCheckup from "@/components/assistence/AssistenceCheckup";

import { getSiteSettings } from "@/lib/supabase/site-settings";
import { siteConfig } from "@/config/site";

async function AssistenceContent() {
  await connection();

  const settings = await getSiteSettings();

  if (!settings) {
    throw new Error("Configurações da loja não encontradas.");
  }

  const whatsappButton = settings.whatsapp_button || siteConfig.whatsappButton;

  return (
    <div className="container">
      <HeroAssistence />
      <AssistenceCheckup whatsappButton={whatsappButton} />
    </div>
  );
}

export default function AssistencePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-96 flex items-center justify-center">
          <p className="text-(--muted)">Carregando...</p>
        </main>
      }
    >
      <AssistenceContent />
    </Suspense>
  );
}
