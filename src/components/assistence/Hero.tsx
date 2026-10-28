import Image from "next/image";

export default function HeroAssistence() {
  return (
    <section className="relative w-full overflow-hidden">
      {/*------------------ Imagem desktop --------------------*/}

      <div className="relative hidden w-full md:block">
        <Image
          src="/images/assistence/hero/hero-assistence-desktop.png"
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
          src="/images/assistence/hero/hero-assistence-mobile.png"
          alt=""
          width={941}
          height={1672}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
      </div>

      {/*---------------------- Conteúdo ----------------------*/}

      <div className="absolute inset-0 z-10 px-4 pt-[83%] lg:px-8 lg:pt-32 md:px-8 md:pt-16">
        <p className="mb-4 text-md text-(--muted) lg:text-lg">
          Assistência Técnica especializada
        </p>

        <h1 className="text-4xl font-bold text-(--foreground) lg:text-6xl">
          SEU CELULAR
        </h1>

        <h1 className="text-4xl font-bold text-(--primary) mb-4 lg:text-6xl">
          PRECISA DE REPARO?
        </h1>

        <p className="text-md text-(--muted) lg:text-lg lg:mb-4">
          Conte com a{" "}
          <span className="text-(--primary) font-bold">S.A Smart</span> para
          isso,
          <br />
          solicite um orçamento pelo WhatsApp e
          <br />
          agende agora mesmo seu atendimento.
        </p>
      </div>
    </section>
  );
}
