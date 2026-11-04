import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: "Não foi possível encerrar a sessão." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao encerrar a sessão." },
      { status: 500 },
    );
  }
}
