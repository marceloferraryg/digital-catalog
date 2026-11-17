import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { updateSiteSettings } from "@/lib/supabase/site-settings";

export async function PUT(request: NextRequest) {
  try {
    // Verifica se existe um administrador ativo
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Verifica a permissão de gerenciamento
    const supabase = await createClient();

    const { data: permitted, error: permissionError } = await supabase.rpc(
      "has_admin_permission",
      {
        permission_code: "settings.manage",
      },
    );

    if (permissionError || permitted !== true) {
      return NextResponse.json(
        { error: "Você não tem permissão para alterar as configurações." },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    // Validação dos campos principais
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 100
    ) {
      return NextResponse.json(
        { error: "Informe um nome válido para a loja." },
        { status: 400 },
      );
    }

    if (body.description != null && typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Descrição inválida." },
        { status: 400 },
      );
    }

    const textFields = [
      "whatsapp_button",
      "whatsapp",
      "phone",
      "email",
    ] as const;

    for (const field of textFields) {
      if (body[field] != null && typeof body[field] !== "string") {
        return NextResponse.json(
          { error: `Campo ${field} inválido.` },
          { status: 400 },
        );
      }
    }

    const jsonFields = ["address", "hours", "socials"] as const;

    for (const field of jsonFields) {
      if (
        !body[field] ||
        typeof body[field] !== "object" ||
        Array.isArray(body[field])
      ) {
        return NextResponse.json(
          { error: `Dados de ${field} inválidos.` },
          { status: 400 },
        );
      }
    }

    const updated = await updateSiteSettings({
      name: body.name.trim(),
      description: body.description ?? "",
      whatsapp_button: body.whatsapp_button ?? "",
      whatsapp: body.whatsapp ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      address: body.address,
      hours: body.hours,
      socials: body.socials,
    });

    return NextResponse.json({
      message: "Configurações atualizadas com sucesso.",
      settings: updated,
    });
  } catch (error) {
    console.error("Erro na API de configurações:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar as configurações." },
      { status: 500 },
    );
  }
}
