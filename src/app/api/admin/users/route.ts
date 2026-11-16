import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (admin.role !== "master") {
      return NextResponse.json(
        { error: "Somente administradores Master podem listar usuários." },
        { status: 403 },
      );
    }

    const supabase = createAdminClient();

    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        username,
        name,
        role,
        active,
        created_at,
        admin_user_permissions (
          admin_permissions (
            id,
            code,
            name,
            description
          )
        )
      `,
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao listar usuários:", error);

      return NextResponse.json(
        { error: "Não foi possível carregar os usuários." },
        { status: 500 },
      );
    }

    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authError) {
      console.error("Erro ao buscar e-mails dos usuários:", authError);

      return NextResponse.json(
        { error: "Não foi possível carregar os e-mails dos usuários." },
        { status: 500 },
      );
    }

    const emailById = new Map(
      authUsers.users.map((user) => [user.id, user.email ?? ""]),
    );

    const result = (users ?? []).map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: emailById.get(user.id) ?? "",
      role: user.role,
      active: user.active,
      created_at: user.created_at,

      permissions: (user.admin_user_permissions ?? []).flatMap((item) => {
        const permission = item.admin_permissions;

        if (!permission) return [];

        return Array.isArray(permission) ? permission : [permission];
      }),
    }));

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Erro na API de listagem de usuários:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao carregar os usuários." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    // Somente Master pode cadastrar usuários
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (admin.role !== "master") {
      return NextResponse.json(
        { error: "Somente administradores Master podem cadastrar usuários." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const permissionIds = body.permissionIds;

    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Informe um nome válido com até 100 caracteres." },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "O username deve ter de 3 a 30 caracteres e conter apenas letras, números, ponto, hífen ou underline.",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    if (password.length < 6 || password.length > 256) {
      return NextResponse.json(
        { error: "A senha deve ter entre 6 e 256 caracteres." },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(permissionIds) ||
      !permissionIds.every((id: unknown) => typeof id === "string") ||
      new Set(permissionIds).size !== permissionIds.length
    ) {
      return NextResponse.json(
        { error: "A seleção de permissões é inválida." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Confere se todas as permissões enviadas existem
    const { data: permissions, error: permissionsError } = await supabase
      .from("admin_permissions")
      .select("id")
      .in("id", permissionIds);

    if (permissionsError) {
      console.error("Erro ao validar permissões:", permissionsError);

      return NextResponse.json(
        { error: "Não foi possível validar as permissões." },
        { status: 500 },
      );
    }

    if ((permissions?.length ?? 0) !== permissionIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais permissões selecionadas são inválidas." },
        { status: 400 },
      );
    }

    // Verifica se o username já existe
    const { data: existingUsername, error: usernameError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (usernameError) {
      console.error("Erro ao verificar username:", usernameError);

      return NextResponse.json(
        { error: "Não foi possível verificar o username." },
        { status: 500 },
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "Este username já está em uso." },
        { status: 409 },
      );
    }

    // Cria a conta no Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Erro ao criar usuário no Auth:", authError);

      return NextResponse.json(
        {
          error:
            authError?.message === "User already registered"
              ? "Este e-mail já está cadastrado."
              : "Não foi possível criar a conta de autenticação.",
        },
        { status: 400 },
      );
    }

    createdUserId = authData.user.id;

    // Cria o registro administrativo
    const { error: userError } = await supabase.from("users").insert({
      id: createdUserId,
      username,
      name,
      role: "admin",
      active: true,
      created_by: admin.id,
    });

    if (userError) {
      console.error("Erro ao criar registro administrativo:", userError);

      throw new Error(
        userError.code === "23505"
          ? "Este username já está em uso."
          : "Não foi possível salvar o cadastro administrativo.",
      );
    }

    // Vincula as permissões selecionadas
    if (permissionIds.length > 0) {
      const permissionRecords = permissionIds.map((permissionId: string) => ({
        user_id: createdUserId,
        permission_id: permissionId,
      }));

      const { error: permissionInsertError } = await supabase
        .from("admin_user_permissions")
        .insert(permissionRecords);

      if (permissionInsertError) {
        console.error("Erro ao vincular permissões:", permissionInsertError);

        throw new Error("Não foi possível vincular as permissões.");
      }
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: createdUserId,
          username,
          name,
          role: "admin",
          active: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao cadastrar administrador:", error);

    // Remove a conta criada caso alguma etapa posterior falhe
    if (createdUserId) {
      try {
        const supabase = createAdminClient();
        await supabase.auth.admin.deleteUser(createdUserId);
      } catch (cleanupError) {
        console.error("Erro ao limpar cadastro incompleto:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao cadastrar o administrador.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (admin.role !== "master") {
      return NextResponse.json(
        { error: "Somente administradores Master podem editar usuários." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { id, name, username, email, password, permissionIds } = body;

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "Usuário inválido." }, { status: 400 });
    }

    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return NextResponse.json(
        { error: "Informe um nome válido com até 100 caracteres." },
        { status: 400 },
      );
    }

    const normalizedUsername =
      typeof username === "string" ? username.trim().toLowerCase() : "";

    if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Username inválido." },
        { status: 400 },
      );
    }

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      normalizedEmail.length > 254
    ) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    if (
      password !== undefined &&
      password !== "" &&
      (typeof password !== "string" ||
        password.length < 6 ||
        password.length > 256)
    ) {
      return NextResponse.json(
        { error: "A senha deve ter entre 6 e 256 caracteres." },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(permissionIds) ||
      !permissionIds.every(
        (permissionId: unknown) => typeof permissionId === "string",
      ) ||
      new Set(permissionIds).size !== permissionIds.length
    ) {
      return NextResponse.json(
        { error: "A seleção de permissões é inválida." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    // Contas Master não podem ter seus dados ou permissões alterados.
    if (targetUser.role === "master") {
      return NextResponse.json(
        { error: "Contas Master não podem ser editadas por este formulário." },
        { status: 403 },
      );
    }

    const { data: permissions, error: permissionsError } = await supabase
      .from("admin_permissions")
      .select("id")
      .in("id", permissionIds);

    if (permissionsError) {
      return NextResponse.json(
        { error: "Não foi possível validar as permissões." },
        { status: 500 },
      );
    }

    if ((permissions?.length ?? 0) !== permissionIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais permissões são inválidas." },
        { status: 400 },
      );
    }

    const { data: existingUsername, error: usernameError } = await supabase
      .from("users")
      .select("id")
      .eq("username", normalizedUsername)
      .neq("id", id)
      .maybeSingle();

    if (usernameError) {
      return NextResponse.json(
        { error: "Não foi possível verificar o username." },
        { status: 500 },
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: "Este username já está em uso." },
        { status: 409 },
      );
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      email: normalizedEmail,
      ...(password ? { password } : {}),
    });

    if (authError) {
      return NextResponse.json(
        { error: "Não foi possível atualizar a conta de autenticação." },
        { status: 400 },
      );
    }

    const { error: userError } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        username: normalizedUsername,
      })
      .eq("id", id);

    if (userError) {
      console.error("Erro ao atualizar usuário:", userError);

      return NextResponse.json(
        { error: "Não foi possível atualizar os dados do usuário." },
        { status: 500 },
      );
    }

    const { error: deletePermissionsError } = await supabase
      .from("admin_user_permissions")
      .delete()
      .eq("user_id", id);

    if (deletePermissionsError) {
      return NextResponse.json(
        { error: "Não foi possível atualizar as permissões." },
        { status: 500 },
      );
    }

    if (permissionIds.length > 0) {
      const permissionRecords = permissionIds.map((permissionId: string) => ({
        user_id: id,
        permission_id: permissionId,
      }));

      const { error: insertPermissionsError } = await supabase
        .from("admin_user_permissions")
        .insert(permissionRecords);

      if (insertPermissionsError) {
        console.error("Erro ao inserir permissões:", insertPermissionsError);

        return NextResponse.json(
          { error: "Não foi possível salvar as novas permissões." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao editar administrador:", error);

    return NextResponse.json(
      { error: "Ocorreu um erro ao editar o usuário." },
      { status: 500 },
    );
  }
}
