"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { SiteSettings } from "@/lib/supabase/site-settings";

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

import { MapPin, CalendarClock, Menu, X, ArrowRight } from "lucide-react";

type HeaderStoreProps = {
  settings: SiteSettings;
};

export default function HeaderStore({ settings }: HeaderStoreProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SOCIALS = [
    {
      label: "Instagram",
      href: settings.socials?.instagram,
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: settings.socials?.facebook,
      icon: FaFacebook,
    },
    {
      label: "TikTok",
      href: settings.socials?.tiktok,
      icon: FaTiktok,
    },
    {
      label: "YouTube",
      href: settings.socials?.youtube,
      icon: FaYoutube,
    },
  ].filter((social) => social.href);

  const MENU = [
    { label: "Home", href: "/" },
    { label: "Produtos", href: "/products" },
    { label: "Assistência Técnica", href: "/assistence" },
    { label: "Contato", href: "/contact" },
  ];

  const city = settings.address?.city || "";
  const state = settings.address?.state || "";

  const hours = [settings.hours?.mondayToFriday, settings.hours?.saturday]
    .filter(Boolean)
    .join(" | ");

  const whatsappButton = settings.whatsapp_button || siteConfig.whatsappButton;

  return (
    <header className="relative w-full bg-(--background)">
      {/* ---------------- Menu mobile ---------------- */}

      <div className="container relative flex h-24 w-full items-center md:hidden">
        {/* Botão do menu */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="absolute left-4 z-50 flex size-12 touch-manipulation items-center justify-center"
        >
          {isMenuOpen ? (
            <X size={28} color="var(--primary)" />
          ) : (
            <Menu size={28} color="var(--primary)" />
          )}
        </button>

        {/* Logo centralizada */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2"
          aria-label="Página inicial"
        >
          <Image
            src={siteConfig.logo}
            alt={settings.name}
            width={150}
            height={50}
            priority
          />
        </Link>

        {/* Backdrop */}
        {isMenuOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Menu lateral */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="absolute left-0 top-24 z-50 w-72 max-w-[85vw] md:hidden"
          >
            <div className="flex min-h-64 max-h-[calc(100dvh-6rem)] flex-col overflow-y-auto bg-(--surface) shadow-xl">
              <nav className="flex flex-col gap-1 p-3">
                {MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-md p-3 text-(--foreground) transition-colors hover:bg-(--primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-(--foreground) group-hover:text-black group-hover:font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Redes sociais */}
              {SOCIALS.length > 0 && (
                <div className="flex gap-4 p-4 justify-center items-center border-t border-(--border)">
                  {SOCIALS.map((social) => (
                    <Link
                      key={social.label}
                      href={social.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="group hover:text-(--primary) transition-colors w-12 h-12 justify-center items-center flex"
                    >
                      <social.icon
                        size={28}
                        className="text-(--foreground) group-hover:text-(--primary) transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              )}

              {/* Informações da loja */}
              <div className="mt-auto flex flex-col gap-4 border-t border-(--border) p-4">
                {(city || state) && (
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="shrink-0 text-(--primary)" />
                    <p className="text-xs text-(--foreground)">
                      {[city, state].filter(Boolean).join(" - ")}
                    </p>
                  </div>
                )}

                {hours && (
                  <div className="flex items-center gap-2">
                    <CalendarClock
                      size={20}
                      className="shrink-0 text-(--primary)"
                    />
                    <p className="text-xs text-(--foreground)">{hours}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center border-t border-(--border) p-4">
                <Link
                  href={"/admin"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Painel administrativo"
                  className="group flex items-center justify-center"
                >
                  <span
                    className="group text-xs text-(--foreground) group-hover:text-(--primary) 
                                    transition-colors flex items-center gap-2 font-regular"
                  >
                    Admin
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Menu desktop ---------------- */}

      <div className="container mx-auto hidden h-40 w-full flex-col items-center pb-2 md:flex">
        {/* Faixa superior com informações */}
        <div className="flex h-12 w-full items-center bg-(--surface) justify-around">
          <div className="flex gap-12 items-center justify-center">
            {(city || state) && (
              <div className="flex items-center gap-2">
                <MapPin
                  size={20}
                  className="text-(--primary)"
                  strokeWidth={2}
                />
                <p className="text-sm text-(--foreground)">
                  {[city, state].filter(Boolean).join(" - ")}
                </p>
              </div>
            )}

            {hours && (
              <div className="flex items-center gap-2">
                <CalendarClock
                  size={20}
                  className="text-(--primary)"
                  strokeWidth={2}
                />
                <p className="text-sm text-(--foreground)">{hours}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-8">
            {SOCIALS.length > 0 && (
              <div className="flex gap-4 justify-center items-center">
                {SOCIALS.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group hover:text-(--primary) transition-colors w-10 h-10 justify-center items-center flex"
                  >
                    <social.icon
                      size={24}
                      className="text-(--foreground) group-hover:text-(--primary) transition-colors"
                    />
                  </Link>
                ))}
              </div>
            )}

            <Link
              href={`https://wa.me/${whatsappButton}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center gap-2 bg-(--whatsapp) px-4 py-1 rounded-md"
            >
              <FaWhatsapp size={24} color="black" />
              <span className="group text-sm text-black group-hover:text-(--primary) transition-colors flex items-center gap-2 font-bold">
                Chamar agora
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center border-t border-(--border) p-4">
            <Link
              href={"/admin"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Painel administrativo"
              className="group flex items-center justify-center"
            >
              <span
                className="group text-xs text-(--foreground) group-hover:text-(--primary) 
                                    transition-colors flex items-center gap-2 font-regular"
              >
                Admin
              </span>
            </Link>
          </div>
        </div>

        {/* Logo e navegação */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-between gap-6 px-8">
          <Link href="/" aria-label="Página inicial" className="shrink-0">
            <Image
              src={siteConfig.logo}
              alt={settings.name}
              width={200}
              height={50}
              priority
            />
          </Link>

          <nav className="flex items-center gap-2 mr-16">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-md p-3 text-(--foreground) transition-colors hover:bg-(--primary) mt-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                <span className="text-(--foreground) group-hover:text-black group-hover:font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
