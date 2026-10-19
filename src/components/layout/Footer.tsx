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

import {
  ArrowRight,
  Package,
  ShieldCheck,
  CreditCard,
  Headset,
  MapPin,
  CalendarClock,
} from "lucide-react";

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
    <footer
      className="container bg-(--background) items-center justify-center 
                  flex flex-col gap-4"
    >
      <div className="flex flex-col items-center justify-center gap-4 mt-4 md:justify-around ">
        <div className="flex flex-col justify-center items-center md:flex-row md:w-full md:justify-around">
          {/* ---------------- LOGO E REDES SOCIAIS ---------------- */}

          <div className="flex flex-col items-center justify-center gap-2 w-100">
            <div className="flex flex-col items-center text-center px-12 gap-2">
              <div className="flex items-center justify-center w-80">
                <Link href="/" className="" aria-label="Página inicial">
                  <Image
                    src={siteConfig.logo}
                    alt={siteConfig.name}
                    width={200}
                    height={50}
                    priority
                  />
                </Link>
              </div>
              <p className="text-sm text-(--foreground) text-center">
                Tecnologia, acessorios e a melhor assistência técnica. Conetando
                você a melhor tecnologia!
              </p>
            </div>
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
                    size={28}
                    className="text-(--foreground) group-hover:text-(--primary) transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* ---------------- LINK DO WHATSAPP ---------------- */}

          <div
            className="flex flex-col items-center justify-center gap-2 mt-4
                   border border-(--primary) rounded-md p-4 w-80"
          >
            <p className="flex text-md text-(--primary) font-semibold gap-2 justify-center items-center">
              <FaWhatsapp size={36} className="color-(--primary)" />
              Fale agora pelo WhatsApp
            </p>
            <span className="text-sm text-(--muted) text-center">
              Tire suas dúvidas, pergunte sobre nossos produtos e serviços ou
              peça um orçamento!
            </span>
            <Link
              href={`https://wa.me/${siteConfig.whatsappButton}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center gap-2 bg-(--whatsapp) p-3 rounded-md 
                         mt-2"
            >
              <FaWhatsapp size={28} color="black" />
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
        </div>

        {/* ---------------- INFOS SERVICES ---------------- */}

        <div
          className="flex flex-col items-start justify-center gap-4 mt-4 py-4 w-full px-8
                      border-t border-b border-(--border) md:flex-row md:w-full md:justify-around"
        >
          <div className="flex items-center gap-2 text-(--foreground) justify-center">
            <div>
              <Package size={36} className="text-(--primary)" />
            </div>
            <div>
              <p className="flex text-md text-(--foreground) font-semibold items-center">
                Produtos de qualidade
              </p>
              <p className="text-xs text-(--muted)">
                As melhores marcas em eletronicos e acessórios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-(--foreground) justify-center">
            <div>
              <ShieldCheck size={36} className="text-(--primary)" />
            </div>
            <div>
              <p className="flex text-md text-(--foreground) font-semibold items-center">
                Assistência técnica especializada
              </p>
              <p className="text-xs text-(--muted)">
                Técnicos experientes e atendimento confiável.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-(--foreground) justify-center">
            <div>
              <CreditCard size={36} className="text-(--primary)" />
            </div>
            <div>
              <p className="flex text-md text-(--foreground) font-semibold items-center">
                Pagamento facilitado
              </p>
              <p className="text-xs text-(--muted)">
                Diversas formas de pagamento na loja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-(--foreground) justify-center">
            <div>
              <Headset size={36} className="text-(--primary)" />
            </div>
            <div>
              <p className="flex text-md text-(--foreground) font-semibold items-center">
                Atendimento personalizado
              </p>
              <p className="text-xs text-(--muted)">
                Suporte antes e depois da compra.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center md:flex-row md:w-full md:justify-around">
          {/* ---------------- LOCATION ---------------- */}

          <div className="flex flex-col items-start justify-center gap-4 px-8">
            <h1 className="text-(--foreground) text-lg font-semibold border-b-2 border-(--primary) mb-2">
              Nossa loja
            </h1>
            <div className="flex items-center gap-2 text-(--foreground) justify-center">
              <div>
                <MapPin size={36} className="text-(--primary)" />
              </div>
              <div>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.address.street}
                </p>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.address.neighborhood} - {siteConfig.address.city}/
                  {siteConfig.address.state}
                </p>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.address.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-(--foreground) justify-center">
              <div>
                <CalendarClock size={36} className="text-(--primary)" />
              </div>
              <div>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.hours.mondayToFriday}
                </p>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.hours.saturday}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-(--foreground) justify-center">
              <div>
                <FaWhatsapp size={36} className="text-(--primary)" />
              </div>
              <div>
                <p className="flex text-sm text-(--muted) items-center">
                  {siteConfig.whatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* ---------------- PAYMENT METOD ---------------- */}

          <div
            className="flex flex-col items-start justify-center gap-4 mt-4 py-4 px-8
                          border-t border-(--border) md:border-t-0 md:mt-0"
          >
            <h1 className="text-(--foreground) text-lg font-semibold border-b-2 border-(--primary)">
              Meios de pagamento
            </h1>
            <Image
              src={"/images/payment-metodd.png"}
              alt={"Metodos de pagamentos"}
              width={500}
              height={50}
              priority
            />
          </div>
        </div>
      </div>

      {/* ---------------- DIREITOS RESERVADOS ---------------- */}
      <div className="flex items-center gap-2 text-center mt-4 bg-(--surface) py-3 px-4 justify-center w-full">
        <p className="text-sm text-(--foreground)">
          &copy; 2026 - {siteConfig.name} - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
