import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

import { ArrowRight } from "lucide-react";

export default function FooterStore() {
  const SOCIALS = [
    {
      label: "Instagram",
      href: siteConfig.socials.instagram,
      icon: FaInstagram,
    },
    { label: "Facebook", href: siteConfig.socials.facebook, icon: FaFacebook },
    { label: "TikTok", href: siteConfig.socials.tiktok, icon: FaTiktok },
    { label: "YouTube", href: siteConfig.socials.youtube, icon: FaYoutube },
  ];

  return (
    <footer className="container bg-(--background) border-t border-(--border) items-center justify-center flex flex-col gap-4 py-6 px-4">
      {/* ---------------- LOGO E REDES SOCIAIS ---------------- */}
      <div className="flex flex-col m-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="" aria-label="Página inicial">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={200}
              height={50}
              priority
            />
          </Link>

          <p className="text-sm text-(--foreground)">
            Tecnologia, acessorios e a melhor assistência técnica. Conetando
            você a melhor tecnologia!
          </p>

          <div className="flex gap-6 mt-2">
            {SOCIALS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group hover:text-(--primary) transition-colors bg-(--surface) 
                            p-3 rounded-md justify-center items-center flex"
              >
                <social.icon
                  size={24}
                  className="text-(--foreground) group-hover:text-(--primary) transition-colors"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- LINK DO WHATSAPP ---------------- */}

      <div
        className="flex flex-col items-center justify-center gap-2 mt-4
                   border border-(--border) rounded-md p-4 w-80 bg-(--surface)"
      >
        <p className="flex text-md text-(--primary) font-semibold gap-2 justify-center items-center">
          <FaWhatsapp size={32} className="color-(--primary)" />
          Fale agora pelo WhatsApp
        </p>
        <span className="text-xs text-(--foreground) text-center">
          Tire suas dúvidas, pergunte sobre nossos produtos e serviços ou peça
          um orçamento!
        </span>
        <Link
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex items-center justify-center gap-2 bg-(--whatsapp) p-3 rounded-md 
                         mt-2"
        >
          <FaWhatsapp size={24} color="black" />
          <span
            className="group text-sm text-black group-hover:text-(--primary) transition-colors 
                            flex items-center gap-2 font-bold"
          >
            Chamar agora
            <ArrowRight
              size={24}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </Link>
      </div>

      {/* ---------------- DIREITOS RESERVADOS ---------------- */}
      <div className="flex items-center gap-2 text-center mt-4 bg-(--surface) py-3 px-4 justify-end w-full">
        <p className="text-sm text-(--foreground)">
          &copy; 2026 - {siteConfig.name} - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
