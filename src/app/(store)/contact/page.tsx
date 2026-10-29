import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
  Headset,
  Zap,
} from "lucide-react";

import { siteConfig } from "@/config/site";

const STORE_IMAGE = "";
// Exemplo futuro: "/images/contact/store.jpg"

const STORE = {
  phone: "", // Informe o telefone da loja
  address: "", // Informe a rua e o número
  city: "Faxinal - PR",
  zipCode: "", // Informe o CEP
  hours: ["Segunda a sexta: 08h às 18h", "Sábado: 08h às 12h"],
};

function getWhatsAppUrl() {
  const phone = String(siteConfig.whatsappButton ?? "").replace(/\D/g, "");

  if (!phone) return "#";

  const message = "Olá! Vim pelo site da S.A Smart e gostaria de atendimento.";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

const BENEFITS = [
  {
    icon: Zap,
    title: "Atendimento rápido",
    description: "Tiramos suas dúvidas o mais breve possível.",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    description: "Atendimento direto com nossa equipe.",
  },
  {
    icon: Store,
    title: "Loja física",
    description: "Atendimento presencial em Faxinal - PR.",
  },
  {
    icon: Headset,
    title: "Suporte especializado",
    description: "Nossa equipe está pronta para ajudar.",
  },
];

export default function ContactPage() {
  const whatsappUrl = getWhatsAppUrl();

  const addressQuery = [STORE.address, STORE.city, STORE.zipCode, "Brasil"]
    .filter(Boolean)
    .join(", ");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressQuery || "S.A Smart, Faxinal, Paraná, Brasil",
  )}`;

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    addressQuery || "Faxinal, Paraná, Brasil",
  )}&output=embed`;

  return (
    <main className="pb-12">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-(--background)" />

        {STORE_IMAGE && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={STORE_IMAGE}
              alt="Interior da loja S.A Smart"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        )}

        <div className="absolute inset-0 -z-10 bg-linear-to-r from-(--background) via-(--background)/95 to-(--background)/65" />

        <div className="mx-auto flex min-h-75 max-w-7xl items-center px-4 py-14 sm:px-6 lg:min-h-90 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-(--primary)">
              Contato
            </p>

            <h1 className="text-4xl font-bold leading-tight text-(--foreground) sm:text-5xl lg:text-6xl">
              Fale com a
              <br />
              S.A <span className="text-(--primary)">Smart</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-(--muted) sm:text-lg">
              Estamos prontos para atender! Entre em contato pelo WhatsApp,
              telefone ou visite nossa loja em Faxinal.
            </p>
          </div>
        </div>
      </section>

      {/* CONTATO E LOCALIZAÇÃO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* CANAIS DE ATENDIMENTO */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-7">
            <h2 className="text-2xl font-bold text-(--foreground)">
              Nossos canais de atendimento
            </h2>

            <p className="mt-2 text-sm text-(--muted) sm:text-base">
              Escolha a melhor forma de falar com a gente.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {/* WHATSAPP */}
              <div className="flex flex-col rounded-xl border border-(--primary) bg-(--background) p-5">
                <div className="flex items-center gap-3">
                  <MessageCircle
                    size={34}
                    className="shrink-0 text-(--primary)"
                  />

                  <h3 className="text-lg font-bold text-(--foreground)">
                    WhatsApp
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-(--muted)">
                  Atendimento rápido e direto com nossa equipe.
                </p>

                <div className="mt-auto pt-5">
                  {whatsappUrl !== "#" ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
                    >
                      Conversar agora
                      <ArrowRight size={18} />
                    </a>
                  ) : (
                    <p className="text-xs text-(--muted)">
                      Configure o WhatsApp em siteConfig.
                    </p>
                  )}
                </div>
              </div>

              {/* TELEFONE */}
              <div className="flex flex-col rounded-xl border border-(--border) bg-(--background) p-5">
                <div className="flex items-center gap-3">
                  <Phone size={32} className="shrink-0 text-(--primary)" />

                  <h3 className="text-lg font-bold text-(--foreground)">
                    Telefone
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-(--muted)">
                  Prefere ligar? Entre em contato com a loja.
                </p>

                <div className="mt-auto pt-5">
                  {STORE.phone ? (
                    <a
                      href={`tel:${STORE.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--primary)"
                    >
                      {STORE.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-(--muted)">
                      Telefone a configurar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LOJA E MAPA */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
                <Store size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-(--foreground)">
                  Nossa loja
                </h2>

                <p className="mt-1 text-sm text-(--muted)">
                  Venha nos visitar em Faxinal.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-(--border) bg-(--background) p-4">
              <MapPin size={23} className="mt-0.5 shrink-0 text-(--primary)" />

              <div className="min-w-0 text-sm leading-6 text-(--muted)">
                {STORE.address && (
                  <p className="font-semibold text-(--foreground)">
                    {STORE.address}
                  </p>
                )}

                <p>{STORE.city}</p>

                {STORE.zipCode && <p>CEP {STORE.zipCode}</p>}

                {!STORE.address && (
                  <p className="text-xs">Endereço completo a configurar.</p>
                )}
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir localização da loja no Google Maps"
              className="group relative mt-4 block h-52 overflow-hidden rounded-xl border border-(--border) bg-(--background) sm:h-60"
            >
              <iframe
                src={mapsEmbedUrl}
                title="Mapa de localização da S.A Smart em Faxinal"
                className="pointer-events-none h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/75 px-4 py-3 text-sm font-semibold text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <MapPin size={17} className="text-(--primary)" />
                Abrir no Google Maps
                <ArrowRight size={16} />
              </span>
            </a>

            <div className="mt-5 flex items-start gap-3">
              <Clock3 size={24} className="mt-0.5 shrink-0 text-(--primary)" />

              <div>
                <h3 className="font-semibold text-(--foreground)">
                  Horário de atendimento
                </h3>

                <ul className="mt-2 space-y-1 text-sm text-(--muted)">
                  {STORE.hours.map((hour) => (
                    <li key={hour}>{hour}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-5 border-t border-(--border) pt-7 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                  <Icon size={22} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-(--foreground)">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-(--muted) sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-(--border) bg-(--surface) p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-(--foreground) sm:text-2xl">
              Podemos ajudar você?
            </h2>

            <p className="mt-2 text-sm text-(--muted)">
              Fale com nossa equipe e tire suas dúvidas.
            </p>
          </div>

          {whatsappUrl !== "#" && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 py-3 font-bold text-black transition-opacity hover:opacity-90 sm:w-auto"
            >
              <MessageCircle size={20} />
              Falar pelo WhatsApp
              <ArrowRight size={18} />
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
