import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (
      !/^[a-z0-9._-]{3,30}$/.test(username) ||
      !password ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 400 },
      );
    }

    // Cliente privilegiado: somente no servidor.
    const adminClient = createAdminClient();

    const { data: admin, error: adminError } = await adminClient
      .from("users")
      .select("id, active")
      .eq("username", username)
      .maybeSingle();

    if (adminError || !admin || !admin.active) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401 },
      );
    }

    // Recupera o email vinculado ao UUID no Supabase Auth.
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.getUserById(admin.id);

    const email = authUser.user?.email;

    if (authError || !email) {
      return NextResponse.json(
        { error: "Não foi possível autenticar. Tente novamente." },
        { status: 401 },
      );
    }

    // Cliente de sessão: autentica com a chave pública e grava cookies.
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError || !data.user) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401 },
      );
    }

    // Confirma que a sessão corresponde ao cadastro administrativo.
    if (data.user.id !== admin.id) {
      await supabase.auth.signOut();

      return NextResponse.json(
        { error: "Não foi possível autenticar. Tente novamente." },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no login administrativo:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao realizar o login." },
      { status: 500 },
    );
  }
}
