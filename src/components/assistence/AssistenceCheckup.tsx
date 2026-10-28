"use client";

import { useState } from "react";
import {
  BatteryCharging,
  Check,
  CircleHelp,
  MessageCircle,
  Smartphone,
  Wrench,
  Zap,
  Camera,
  AudioLines,
  Settings,
  Wifi,
  Droplets,
  ListChecks,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { siteConfig } from "@/config/site";
import { ASSISTANCE_SERVICES, PHONE_BRANDS } from "@/data/assistence";

const SERVICE_ICONS = [
  Smartphone,
  BatteryCharging,
  Zap,
  Camera,
  AudioLines,
  Settings,
  Wifi,
  Wrench,
  Droplets,
  CircleHelp,
];

const OTHER = "Outra opção";

export default function AssistenceCheckup() {
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [family, setFamily] = useState("");
  const [customFamily, setCustomFamily] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [problem, setProblem] = useState("");

  const selectedBrandData = PHONE_BRANDS.find((item) => item.name === brand);
  const selectedBrand = brand === OTHER ? customBrand.trim() : brand;
  const selectedFamily = family === OTHER ? customFamily.trim() : family;
  const selectedModel = model === OTHER ? customModel.trim() : model;
  const availableFamilies = selectedBrandData?.families ?? [];
  const selectedFamilyData = availableFamilies.find(
    (item) => item.name === family,
  );
  const availableModels = selectedFamilyData?.models ?? [];
  const selectedServiceNames = ASSISTANCE_SERVICES.filter((service) =>
    selectedServices.includes(service.id),
  ).map((service) => service.name);
  const serviceNames = [
    ...selectedServiceNames,
    ...(selectedServices.includes(OTHER) && customService.trim()
      ? [customService.trim()]
      : []),
  ];

  const canSubmit =
    selectedBrand.length > 0 &&
    (brand === OTHER || selectedFamily.length > 0) &&
    selectedModel.length > 0 &&
    serviceNames.length > 0;

  function chooseBrand(value: string) {
    setBrand(value);
    setFamily("");
    setCustomFamily("");
    setModel("");
    setCustomModel("");
  }

  function chooseFamily(value: string) {
    setFamily(value);
    setCustomFamily("");
    setModel("");
    setCustomModel("");
  }

  function toggleService(serviceId: string) {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;

    const message = [
      "Olá! Gostaria de solicitar um orçamento para meu celular.",
      "",
      `*Marca:* ${selectedBrand}`,
      ...(selectedFamily ? [`*Família:* ${selectedFamily}`] : []),
      `*Modelo:* ${selectedModel}`,
      "",
      "*Serviços desejados:*",
      ...serviceNames.map((service) => `- ${service}`),
      ...(problem.trim() ? ["", `*Observações:* ${problem.trim()}`] : []),
      "",
      "Poderiam me orientar sobre o orçamento e como funciona o atendimento?",
    ].join("\n");

    const phone = String(siteConfig.whatsappButton).replace(/\D/g, "");
    if (!phone) {
      alert("O número de WhatsApp da loja não está configurado.");
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const fieldClass =
    "min-h-12 w-full rounded-xl border border-(--border) bg-(--background) px-4 text-sm text-(--foreground) outline-none placeholder:text-(--muted) focus:border-(--primary)";
  const optionClass = (active: boolean) =>
    `flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
      active
        ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
        : "border-(--border) text-(--foreground) hover:border-(--primary)"
    }`;

  return (
    <section
      id="checkup"
      aria-labelledby="checkup-title"
      className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16"
    >
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1
          id="checkup-title"
          className="mb-3 text-2xl font-bold text-(--primary) md:text-4xl"
        >
          Vamos cuidar do seu celular?
        </h1>
        <h2 className="mb-2 text-lg font-bold text-(--foreground) md:text-2xl">
          Me conte qual o problema com seu aparelho
        </h2>
        <p className="text-sm text-(--muted) md:text-base">
          Informe os dados do seu celular, escolha os serviços necessários e
          solicite seu orçamento diretamente pelo WhatsApp.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:gap-8">
        <div className="min-w-0 rounded-2xl border border-(--border) bg-(--surface) p-4 sm:p-6 md:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
              <Smartphone size={23} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-(--foreground)">
                Dados do aparelho
              </h3>
              <p className="text-sm text-(--muted)">
                Os campos com * são obrigatórios.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <fieldset>
              <legend className="mb-3 text-md font-semibold text-(--primary)">
                1. Qual é a marca do celular? *
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                {PHONE_BRANDS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-pressed={brand === item.name}
                    onClick={() => chooseBrand(item.name)}
                    className={optionClass(brand === item.name)}
                  >
                    {brand === item.name && <Check size={20} />}
                    {item.name}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={brand === OTHER}
                  onClick={() => chooseBrand(OTHER)}
                  className={optionClass(brand === OTHER)}
                >
                  {brand === OTHER && <Check size={16} />}Outra marca
                </button>
              </div>
              {brand === OTHER && (
                <input
                  value={customBrand}
                  onChange={(event) => setCustomBrand(event.target.value)}
                  placeholder="Digite a marca do aparelho"
                  aria-label="Digite outra marca"
                  maxLength={80}
                  className={`${fieldClass} mt-3`}
                />
              )}
            </fieldset>

            {brand && brand !== OTHER && (
              <fieldset>
                <legend className="mb-3 text-md font-semibold text-(--primary)">
                  2. Qual é a família do aparelho? *
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                  {availableFamilies.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-pressed={family === item.name}
                      onClick={() => chooseFamily(item.name)}
                      className={optionClass(family === item.name)}
                    >
                      {family === item.name && <Check size={16} />}
                      {item.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={family === OTHER}
                    onClick={() => chooseFamily(OTHER)}
                    className={optionClass(family === OTHER)}
                  >
                    {family === OTHER && <Check size={16} />}Não achei a família
                  </button>
                </div>
                {family === OTHER && (
                  <input
                    value={customFamily}
                    onChange={(event) => setCustomFamily(event.target.value)}
                    placeholder="Digite a família (se souber)"
                    aria-label="Digite outra família"
                    maxLength={100}
                    className={`${fieldClass} mt-3`}
                  />
                )}
              </fieldset>
            )}

            {((brand === OTHER && customBrand.trim()) ||
              (brand &&
                brand !== OTHER &&
                family &&
                (family !== OTHER || customFamily.trim()))) && (
              <fieldset>
                <legend className="mb-3 text-md font-semibold text-(--primary)">
                  {brand === OTHER ? "2" : "3"}. Qual é o modelo do celular? *
                </legend>
                {brand !== OTHER &&
                  family !== OTHER &&
                  availableModels.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                      {availableModels.map((item) => (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={model === item}
                          onClick={() => {
                            setModel(item);
                            setCustomModel("");
                          }}
                          className={optionClass(model === item)}
                        >
                          {model === item && <Check size={16} />}
                          {item}
                        </button>
                      ))}
                      <button
                        type="button"
                        aria-pressed={model === OTHER}
                        onClick={() => {
                          setModel(OTHER);
                          setCustomModel("");
                        }}
                        className={optionClass(model === OTHER)}
                      >
                        {model === OTHER && <Check size={16} />}Não achei o
                        modelo
                      </button>
                    </div>
                  )}
                {(brand === OTHER ||
                  family === OTHER ||
                  availableModels.length === 0) && (
                  <p className="mb-3 text-xs text-(--muted)">
                    Digite o modelo do aparelho abaixo.
                  </p>
                )}
                {(model === OTHER ||
                  brand === OTHER ||
                  family === OTHER ||
                  availableModels.length === 0) && (
                  <input
                    value={customModel}
                    onChange={(event) => setCustomModel(event.target.value)}
                    placeholder="Digite o modelo do celular"
                    aria-label="Digite o modelo do celular"
                    maxLength={100}
                    className={`${fieldClass} mt-3`}
                  />
                )}
              </fieldset>
            )}

            {selectedModel && selectedModel !== OTHER && (
              <fieldset>
                <legend className="mb-1 text-md font-semibold text-(--primary)">
                  {brand === OTHER ? "3" : "4"}. Qual serviço você precisa? *
                </legend>
                <p className="mb-3 text-xs text-(--muted)">
                  Você pode selecionar mais de uma opção.
                </p>
                <div className="space-y-3 mb-4">
                  {ASSISTANCE_SERVICES.map((service, index) => {
                    const Icon = SERVICE_ICONS[index] ?? Wrench;
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleService(service.id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${isSelected ? "border-(--primary) bg-(--primary)/5" : "border-(--border) hover:border-(--primary)"}`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-(--primary)/15 text-(--primary)" : "bg-(--background) text-(--muted)"}`}
                        >
                          <Icon size={21} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-(--foreground)">
                            {service.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-(--muted)">
                            {service.description}
                          </span>
                        </span>
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${isSelected ? "border-(--primary) bg-(--primary) text-black" : "border-(--border)"}`}
                        >
                          {isSelected && <Check size={14} />}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-pressed={selectedServices.includes(OTHER)}
                    onClick={() => toggleService(OTHER)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors ${selectedServices.includes(OTHER) ? "border-(--primary) bg-(--primary)/5 text-(--primary)" : "border-(--border) text-(--foreground) hover:border-(--primary)"}`}
                  >
                    <ListChecks size={20} />
                    Outro serviço / não achei minha opção
                    {selectedServices.includes(OTHER) && (
                      <Check size={16} className="ml-auto" />
                    )}
                  </button>
                  {selectedServices.includes(OTHER) && (
                    <input
                      value={customService}
                      onChange={(event) => setCustomService(event.target.value)}
                      placeholder="Qual serviço você precisa?"
                      aria-label="Descreva outro serviço"
                      maxLength={150}
                      className={fieldClass}
                    />
                  )}
                </div>
              </fieldset>
            )}

            <div>
              <label
                htmlFor="problem-description"
                className="mb-2 block text-md font-semibold text-(--primary)"
              >
                Observações{" "}
                <span className="font-normal text-(--muted)">(opcional)</span>
              </label>
              <textarea
                id="problem-description"
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
                placeholder="Conte um pouco mais sobre o problema..."
                rows={4}
                maxLength={1000}
                className="w-full resize-y rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none placeholder:text-(--muted) focus:border-(--primary)"
              />
              <p className="mt-1 text-right text-xs text-(--muted)">
                {problem.length}/1000
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-7 mb-3 flex min-h-13 w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-5 py-4 font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaWhatsapp size={23} />
            Solicitar orçamento pelo WhatsApp
          </button>
          {!canSubmit && (
            <p className="text-center text-xs text-(--muted)">
              Informe a marca, família (quando aplicável), modelo e pelo menos
              um serviço.
            </p>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary)/10 text-(--primary)">
                <CircleHelp size={22} />
              </div>
              <h3 className="font-semibold text-lg text-(--primary)">
                Resumo da solicitação
              </h3>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-(--muted)">Marca</p>
                <p className="mt-1 font-medium text-(--foreground)">
                  {selectedBrand || "Não selecionada"}
                </p>
              </div>
              {selectedFamily && (
                <div>
                  <p className="text-xs text-(--muted)">Família</p>
                  <p className="mt-1 font-medium text-(--foreground)">
                    {selectedFamily}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-(--muted)">Modelo</p>
                <p className="mt-1 font-medium text-(--foreground)">
                  {selectedModel || "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Serviços selecionados</p>
                {serviceNames.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {serviceNames.map((name) => (
                      <li
                        key={name}
                        className="flex items-start gap-2 text-(--foreground)"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-(--primary)"
                        />
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-(--muted)">
                    Nenhum serviço selecionado
                  </p>
                )}
              </div>
              {problem.trim() && (
                <div>
                  <p className="text-xs text-(--muted)">Observações</p>
                  <p className="mt-1 whitespace-pre-line wrap-break-word text-(--foreground)">
                    {problem.trim()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 rounded-xl bg-(--background) p-4">
              <p className="text-sm font-semibold text-(--foreground)">
                Orçamento sob consulta
              </p>
              <p className="mt-1 text-xs leading-5 text-(--muted)">
                Nossa equipe avaliará sua solicitação e orientará você pelo
                WhatsApp.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-(--border) p-5">
            <div className="flex items-center gap-2 text-(--primary)">
              <MessageCircle size={20} />
              <h3 className="font-semibold text-(--foreground)">
                Atendimento direto
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-(--muted)">
              A solicitação será preparada no WhatsApp da S.A Smart. Você poderá
              revisar a mensagem e confirmar o envio pelo aplicativo.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
