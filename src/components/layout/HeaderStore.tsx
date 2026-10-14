"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

import { MapPin, CalendarClock, Menu } from "lucide-react";

export default function HeaderStore() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MENU = [
    {
      label: "Produtos",
      href: "/produtos",
    },
    {
      label: "Assistência Técnica",
      href: "/assistencia-tecnica",
    },
    {
      label: "Contato",
      href: "/contato",
    },
  ];

  return (
    <header
      className="container relative flex-col bg-(--background) items-center justify-center pb-2
                        border-b border-(--border) w-full h-20 md:h-28"
    >
      {/* Sub Menu for descktop */}
      <div className="items-center justify-center gap-16 bg-(--background) w-full h-8 hidden md:flex">
        <section className="flex items-center gap-2">
          <MapPin size={20} color="var(--primary)" strokeWidth={2} />
          <p className="text-(--foreground) text-xs">
            {siteConfig.address.city}-{siteConfig.address.state}
          </p>
        </section>

        <section className="flex items-center gap-2">
          <CalendarClock size={20} color="var(--primary)" strokeWidth={2} />
          <p className="text-(--foreground) text-xs">
            seg-sex: 08h às 18h | sáb: 08h às 12h
          </p>
        </section>
      </div>

      {/* Menu button for mobile view */}
      <div className="flex items-center justify-center w-full">
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={28} color="var(--primary)" />
        </button>
      </div>

      <div className="flex w-full">
        {/* LOGO */}
        <Image
          src={siteConfig.logo}
          alt="Logo"
          width={150}
          height={50}
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:ml-8"
        />
      </div>

      {/* Menu for mobile view */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 w-64  bg-(--surface) z-10 md:hidden">
          <div className="flex flex-col items-center justify-center h-64">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-md text-(--foreground) transition-colors hover:text-(--primary)"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 justify-end mt-24">
              <section className="flex items-center gap-2">
                <MapPin size={20} color="var(--primary)" strokeWidth={2} />
                <p className="text-(--foreground) text-xs">
                  {siteConfig.address.city}-{siteConfig.address.state}
                </p>
              </section>

              <section className="flex items-center gap-2">
                <CalendarClock
                  size={20}
                  color="var(--primary)"
                  strokeWidth={2}
                />
                <p className="text-(--foreground) text-xs">
                  seg-sex: 08h às 18h | sáb: 08h às 12h
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
