"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, Phone, MapPin, Clock, Share2 } from "lucide-react";

import type { SiteSettings } from "@/lib/supabase/site-settings";

type SettingsManagerProps = {
  initialSettings: SiteSettings;
  isMaster: boolean;
};

type SettingsForm = {
  name: string;
  description: string;
  whatsapp_button: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    mapsUrl: string;
  };
  hours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
  };
};

type SectionHeaderProps = {
  icon: typeof Store;
  title: string;
  description: string;
};

function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="font-semibold text-(--foreground)">{title}</h2>
        <p className="mt-1 text-sm text-(--muted)">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsManager({
  initialSettings,
  isMaster,
}: SettingsManagerProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<SettingsForm>({
    name: initialSettings.name ?? "",
    description: initialSettings.description ?? "",
    whatsapp_button: initialSettings.whatsapp_button ?? "",
    whatsapp: initialSettings.whatsapp ?? "",
    phone: initialSettings.phone ?? "",
    email: initialSettings.email ?? "",
    address: {
      street: initialSettings.address?.street ?? "",
      neighborhood: initialSettings.address?.neighborhood ?? "",
      city: initialSettings.address?.city ?? "",
      state: initialSettings.address?.state ?? "",
      zipCode: initialSettings.address?.zipCode ?? "",
      mapsUrl: initialSettings.address?.mapsUrl ?? "",
    },
    hours: {
      mondayToFriday: initialSettings.hours?.mondayToFriday ?? "",
      saturday: initialSettings.hours?.saturday ?? "",
      sunday: initialSettings.hours?.sunday ?? "",
    },
    socials: {
      instagram: initialSettings.socials?.instagram ?? "",
      facebook: initialSettings.socials?.facebook ?? "",
      tiktok: initialSettings.socials?.tiktok ?? "",
      youtube: initialSettings.socials?.youtube ?? "",
    },
  });

  const canManage = true;

  function updateField<K extends keyof SettingsForm>(
    field: K,
    value: SettingsForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  }

  function updateNestedField<K extends "address" | "hours" | "socials">(
    group: K,
    field: keyof SettingsForm[K],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));

    setSuccess("");
    setError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Não foi possível salvar as configurações.",
        );
      }

      setSuccess("Configurações atualizadas com sucesso!");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition focus:border-(--primary) disabled:cursor-not-allowed disabled:opacity-50";

  const labelClass = "mb-2 block text-sm font-medium text-(--foreground)";

  return (
    <div className="mx-auto mb-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--foreground)">
          Configurações
        </h1>

        <p className="mt-1 text-sm text-(--muted)">
          Gerencie as informações comerciais e os dados de contato da loja.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identidade */}
        <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          <SectionHeader
            icon={Store}
            title="Identidade da loja"
            description="Informações principais exibidas no site."
          />

          <div className="grid gap-5">
            <div>
              <label className={labelClass}>Nome da loja</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                maxLength={100}
                required
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                className={inputClass}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                disabled={!canManage || saving}
              />
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          <SectionHeader
            icon={Phone}
            title="Contato"
            description="Telefones e canais de atendimento da loja."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>WhatsApp (número para links)</label>
              <input
                className={inputClass}
                value={form.whatsapp_button}
                onChange={(e) => updateField("whatsapp_button", e.target.value)}
                placeholder="5543999655339"
                disabled={!canManage || saving}
              />
              <p className="mt-1 text-xs text-(--muted)">
                Somente números, incluindo código do país e DDD.
              </p>
            </div>

            <div>
              <label className={labelClass}>WhatsApp (exibição)</label>
              <input
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="(43) 99965-5339"
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Telefone</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(43) 0000-0000"
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contato@loja.com.br"
                disabled={!canManage || saving}
              />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          <SectionHeader
            icon={MapPin}
            title="Endereço"
            description="Localização física da loja."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Rua / Avenida e número</label>
              <input
                className={inputClass}
                value={form.address.street}
                onChange={(e) =>
                  updateNestedField("address", "street", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Bairro</label>
              <input
                className={inputClass}
                value={form.address.neighborhood}
                onChange={(e) =>
                  updateNestedField("address", "neighborhood", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>CEP</label>
              <input
                className={inputClass}
                value={form.address.zipCode}
                onChange={(e) =>
                  updateNestedField("address", "zipCode", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Cidade</label>
              <input
                className={inputClass}
                value={form.address.city}
                onChange={(e) =>
                  updateNestedField("address", "city", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Estado (UF)</label>
              <input
                className={inputClass}
                value={form.address.state}
                onChange={(e) =>
                  updateNestedField("address", "state", e.target.value)
                }
                maxLength={2}
                disabled={!canManage || saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Link do Google Maps</label>
              <input
                type="url"
                className={inputClass}
                value={form.address.mapsUrl}
                onChange={(e) =>
                  updateNestedField("address", "mapsUrl", e.target.value)
                }
                placeholder="https://maps.google.com/..."
                disabled={!canManage || saving}
              />
            </div>
          </div>
        </section>

        {/* Horários */}
        <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          <SectionHeader
            icon={Clock}
            title="Horário de atendimento"
            description="Horários exibidos para os clientes no site."
          />

          <div className="grid gap-5">
            <div>
              <label className={labelClass}>Segunda a sexta-feira</label>
              <input
                className={inputClass}
                value={form.hours.mondayToFriday}
                onChange={(e) =>
                  updateNestedField("hours", "mondayToFriday", e.target.value)
                }
                placeholder="Seg–Sex: 08h às 18h"
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Sábado</label>
              <input
                className={inputClass}
                value={form.hours.saturday}
                onChange={(e) =>
                  updateNestedField("hours", "saturday", e.target.value)
                }
                placeholder="Sáb: 08h às 12h"
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Domingo</label>
              <input
                className={inputClass}
                value={form.hours.sunday}
                onChange={(e) =>
                  updateNestedField("hours", "sunday", e.target.value)
                }
                placeholder="Dom: Fechado"
                disabled={!canManage || saving}
              />
            </div>
          </div>
        </section>

        {/* Redes sociais */}
        <section className="rounded-xl border border-(--border) bg-(--surface) p-5 sm:p-6">
          <SectionHeader
            icon={Share2}
            title="Redes sociais"
            description="Links dos perfis oficiais da loja."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                type="url"
                className={inputClass}
                value={form.socials.instagram}
                onChange={(e) =>
                  updateNestedField("socials", "instagram", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>Facebook</label>
              <input
                type="url"
                className={inputClass}
                value={form.socials.facebook}
                onChange={(e) =>
                  updateNestedField("socials", "facebook", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>TikTok</label>
              <input
                type="url"
                className={inputClass}
                value={form.socials.tiktok}
                onChange={(e) =>
                  updateNestedField("socials", "tiktok", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>

            <div>
              <label className={labelClass}>YouTube</label>
              <input
                type="url"
                className={inputClass}
                value={form.socials.youtube}
                onChange={(e) =>
                  updateNestedField("socials", "youtube", e.target.value)
                }
                disabled={!canManage || saving}
              />
            </div>
          </div>
        </section>

        {/* Mensagens e botão */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500"
          >
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canManage || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
