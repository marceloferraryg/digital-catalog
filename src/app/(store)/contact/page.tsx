import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Headset,
  Zap,
  Share2,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/supabase/site-settings";

const STORE_IMAGE = "";

// Componente responsável por buscar as configurações e montar a página.
async function ContactContent() {
  const settings = await getSiteSettings();

  if (!settings) {
    throw new Error("Configurações da loja não encontradas.");
  }

  // Dados comerciais do Supabase
  const address = settings.address || {};
  const hours = settings.hours || {};
  const socials = settings.socials || {};

  const storeName = settings.name;

  const whatsappButton = String(
    settings.whatsapp_button || siteConfig.whatsappButton || "",
  ).replace(/\D/g, "");

  const phone = settings.phone || "";

  // WhatsApp
  const whatsappMessage = `Olá! Vim pelo site da ${storeName} e gostaria de atendimento.`;

  const whatsappUrl = whatsappButton
    ? `https://wa.me/${whatsappButton}?text=${encodeURIComponent(whatsappMessage)}`
    : "";

  // Endereço
  const addressLines = [
    address.street,
    address.neighborhood,
    address.city,
    address.state,
    address.zipCode,
    "Brasil",
  ].filter(Boolean);

  const addressQuery = addressLines.join(", ");

  const fallbackAddress = [storeName, address.city, address.state, "Brasil"]
    .filter(Boolean)
    .join(", ");

  const mapsQuery = addressQuery || fallbackAddress;

  const mapsUrl =
    address.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mapsQuery,
    )}`;

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapsQuery,
  )}&output=embed`;

  // Horários
  const storeHours = [
    hours.mondayToFriday,
    hours.saturday,
    hours.sunday,
  ].filter(Boolean);

  // Redes sociais
  const SOCIALS = [
    {
      label: "Instagram",
      href: socials.instagram,
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: socials.facebook,
      icon: FaFacebook,
    },
    {
      label: "TikTok",
      href: socials.tiktok,
      icon: FaTiktok,
    },
    {
      label: "YouTube",
      href: socials.youtube,
      icon: FaYoutube,
    },
  ].filter((social) => social.href);

  // Diferenciais
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
      description: `Atendimento presencial em ${address.city || "nossa cidade"}.`,
    },
    {
      icon: Headset,
      title: "Suporte especializado",
      description: "Nossa equipe está pronta para ajudar.",
    },
  ];

  return (
    <main className="pb-12">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-(--background)" />

        {STORE_IMAGE && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={STORE_IMAGE}
              alt={`Interior da loja ${storeName}`}
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
              <span className="text-(--primary)">{storeName}</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-(--muted) sm:text-lg">
              Estamos prontos para atender! Entre em contato pelo WhatsApp,
              telefone ou visite nossa loja em {address.city || "nossa cidade"}.
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
              {whatsappUrl && (
                <div className="flex flex-col rounded-xl border border-(--primary) bg-(--background) p-5">
                  <div className="flex items-center gap-3">
                    <FaWhatsapp
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
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-(--whatsapp) px-4 py-3 transition-opacity hover:opacity-90"
                    >
                      <span className="text-sm font-bold text-black">
                        Conversar agora
                      </span>

                      <ArrowRight
                        size={22}
                        color="black"
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              )}

              {/* TELEFONE */}
              {phone && (
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
                    <a
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-(--border) bg-(--surface) px-3 py-3 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--primary)"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {/* REDES SOCIAIS */}
              {SOCIALS.length > 0 && (
                <div className="flex flex-col rounded-xl border border-(--border) bg-(--background) p-5">
                  <div className="flex items-center gap-3">
                    <Share2 size={32} className="shrink-0 text-(--primary)" />

                    <h3 className="text-lg font-bold text-(--foreground)">
                      Redes Sociais
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-(--muted)">
                    Siga-nos nas redes sociais!
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-6 p-6">
                    {SOCIALS.map((social) => (
                      <Link
                        key={social.label}
                        href={social.href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="group flex size-10 items-center justify-center transition-colors hover:text-(--primary)"
                      >
                        <social.icon
                          size={32}
                          className="text-(--foreground) transition-colors group-hover:text-(--primary)"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOJA E MAPA */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center text-(--primary)">
                <Store size={32} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-(--foreground)">
                  Nossa loja
                </h2>

                <p className="mt-1 text-sm text-(--muted)">
                  Venha nos visitar em {address.city || "nossa cidade"}.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-(--border) bg-(--background) p-4">
              <MapPin size={24} className="mt-0.5 shrink-0 text-(--primary)" />

              <div className="min-w-0 text-md leading-6 text-(--muted)">
                {address.street && (
                  <p className="font-semibold text-(--foreground)">
                    {address.street}
                  </p>
                )}

                {address.neighborhood && (
                  <p className="text-sm">{address.neighborhood}</p>
                )}

                <p className="text-sm">
                  {[address.city, address.state].filter(Boolean).join(" - ")}
                </p>

                {address.zipCode && (
                  <p className="text-sm">CEP {address.zipCode}</p>
                )}

                {!address.street && !address.city && (
                  <p className="text-xs">Endereço completo a configurar.</p>
                )}
              </div>
            </div>

            {/* MAPA */}
            {mapsQuery && (
              <div className="mt-4">
                <div className="group relative h-52 overflow-hidden rounded-xl border border-(--border) bg-(--background) sm:h-60">
                  <iframe
                    src={mapsEmbedUrl}
                    title={`Mapa de localização da ${storeName}`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-(--primary) hover:underline"
                >
                  <MapPin size={17} />
                  Abrir no Google Maps
                  <ArrowRight size={16} />
                </a>
              </div>
            )}

            {/* HORÁRIOS */}
            {storeHours.length > 0 && (
              <div className="mt-5 flex items-start gap-3">
                <Clock3
                  size={24}
                  className="mt-0.5 shrink-0 text-(--primary)"
                />

                <div>
                  <h3 className="font-semibold text-(--foreground)">
                    Horário de atendimento
                  </h3>

                  <ul className="mt-2 space-y-1 text-sm text-(--muted)">
                    {storeHours.map((hour) => (
                      <li key={hour}>{hour}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 border-t border-(--border) pt-7 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title} className="flex items-start gap-2">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
                  <Icon size={24} />
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-bold text-(--foreground)">
                    {benefit.title}
                  </h3>

                  <p className="text-xs leading-4 text-(--muted) sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      {whatsappUrl && (
        <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 rounded-2xl border border-(--border) bg-(--surface) p-6 sm:flex-row sm:items-center sm:gap-12 sm:p-8">
            <div>
              <h2 className="text-xl font-bold text-(--foreground) sm:text-2xl">
                Podemos ajudar você?
              </h2>

              <p className="mt-2 text-sm text-(--muted)">
                Fale com nossa equipe e tire suas dúvidas.
              </p>
            </div>

            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-(--whatsapp) px-4 py-3 transition-opacity hover:opacity-90"
            >
              <FaWhatsapp size={34} className="shrink-0 text-black" />

              <span className="text-sm font-bold text-black">
                Conversar agora
              </span>

              <ArrowRight
                size={22}
                color="black"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

// Componente de página: permite o streaming do conteúdo dinâmico.
export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-96 max-w-7xl px-4 py-20 text-center">
          <p className="text-(--muted)">Carregando informações...</p>
        </main>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
