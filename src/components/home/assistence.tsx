import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";

const SERVICES = [
  "Troca de tela",
  "Troca de bateria",
  "Reparo em placas",
  "Conector de carregamento",
  "Instalação de software",
];

export default function AssistenceHome() {
  return (
    <section
      aria-labelledby="assistance-home-title"
      className="mb-8 p-4 lg:p-8"
    >
      <div className="relative isolate min-h-105 w-full overflow-hidden rounded-2xl sm:min-h-120">
        {/* Imagem mobile */}
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/images/home/assistence/assistence-home-mobile.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Imagem desktop */}
        <div className="absolute inset-0 hidden md:block">
          <Image
            src="/images/home/assistence/assistence-home-desktop.png"
            alt=""
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Gradiente de leitura */}
        <div className="absolute inset-0 z-0 bg-linear-to-r from-black via-black/75 to-transparent" />

        {/* Conteúdo */}
        <div className="relative z-10 flex min-h-105 items-center p-5 sm:min-h-120 sm:p-10 lg:p-14">
          <div className="max-w-md">
            <h2
              id="assistance-home-title"
              className="mb-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
            >
              <span className="text-(--primary)">Assistência técnica</span>{" "}
              <span className="text-(--foreground)">especializada</span>
            </h2>

            <p className="mb-5 max-w-sm text-sm leading-6 text-(--foreground) sm:text-base">
              Seu celular precisa de reparo? Conte com a S.A Smart para
              encontrar a solução ideal.
            </p>

            <ul className="space-y-2">
              {SERVICES.map((service) => (
                <li
                  key={service}
                  className="flex items-center gap-2 text-sm text-(--foreground) sm:text-base"
                >
                  <CircleCheck
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-(--primary)"
                  />
                  {service}
                </li>
              ))}
            </ul>

            <Link
              href="/assistence"
              className="group mt-7 inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-xl 
                            bg-(--primary) px-8 py-4 transition focus-visible:outline-2 
                            focus-visible:outline-offset-4 focus-visible:outline-(--primary)"
            >
              <p className="text-black font-bold">Pedir orçamento</p>
              <ArrowRight
                size={23}
                color="black"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
