import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { FaWhatsapp } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/*------------------ Imagem desktop --------------------*/}

      <div className="relative hidden w-full md:block">
        <Image
          src="/images/home/hero/hero-desktop.png"
          alt=""
          width={1983}
          height={793}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </div>

      {/*--------------------- Imagem mobile ------------------*/}

      <div className="relative w-full md:hidden">
        <Image
          src="/images/home/hero/hero-mobile.png"
          alt=""
          width={941}
          height={1672}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </div>

      {/*---------------------- Conteúdo ----------------------*/}

      <div className="absolute inset-0 z-10 px-4 pt-[83%] lg:px-8 lg:pt-8 md:px-4 md:pt-4">
        <p className="flex items-center gap-2 text-md text-(--muted) lg:gap-4 lg:text-lg lg:mb-4 md:gap-2 md:text-lg md:mb-2">
          Smartphones
          <span className="text-2xl text-(--primary)">•</span>
          Acessórios
          <span className="text-2xl text-(--primary)">•</span>
          Assistência
        </p>

        <h1 className="text-4xl font-bold text-(--foreground) lg:text-6xl">
          TUDO PARA O
        </h1>

        <h2 className="text-5xl font-bold text-(--primary) lg:text-7xl">
          SEU CELULAR
        </h2>

        <h2 className="text-4xl font-bold text-(--foreground) lg:text-6xl lg:mb-4">
          EM UM SÓ LUGAR
        </h2>

        <p className="text-md text-(--muted) lg:text-lg lg:mb-4">
          Acessórios, celulares, películas, capinhas
          <br />e assistência técnica especializada.
        </p>

        {/*---------------------- WHATSAPP ----------------------*/}

        <div className="mt-4 flex lg:mt-8">
          <Link
            href={`https://wa.me/${siteConfig.whatsappButton}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chamar no WhatsApp"
            className="group flex items-center justify-center gap-2 rounded-lg bg-(--whatsapp) px-8 py-4"
          >
            <FaWhatsapp size={36} color="black" />

            <span className="flex items-center gap-2 text-lg font-bold text-black">
              Chamar agora
              <ArrowRight
                size={32}
                className="transition-transform group-hover:translate-x-2"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
