"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  UserRound,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Não foi possível realizar o login.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen justify-center overflow-hidden 
                        bg-(--background) px-5 py-10"
    >
      {/* Efeitos de fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full 
                            bg-(--primary)/20 blur-[100px]"
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo e identificação */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Link href="/" className="mb-4" aria-label="Página inicial">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={200}
              height={50}
              priority
            />
          </Link>

          <p className="mt-2 text-sm font-semibold tracking-[0.2em] text-(--muted)">
            PAINEL ADMINISTRATIVO
          </p>
        </div>

        {/* Card de login */}
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-(--foreground)">
              Bem-vindo de volta!
            </h2>

            <p className="mt-2 text-sm text-(--muted)">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuário */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-(--foreground)"
              >
                Usuário
              </label>

              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-(--muted)" />

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-(--border) bg-(--background) 
                                pl-11 pr-4 text-sm text-(--foreground) outline-none transition 
                                placeholder:text-(--muted) focus:border-(--primary) 
                                focus:ring-2 focus:ring-(--primary)/20 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-(--foreground)"
              >
                Senha
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-(--muted)" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-(--border) bg-(--background) 
                                pl-11 pr-12 text-sm text-(--foreground) outline-none transition 
                                placeholder:text-(--muted) focus:border-(--primary) 
                                focus:ring-2 focus:ring-(--primary)/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) 
                                transition hover:text-(--foreground)"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
              >
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no painel"
              )}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="flex justify-center items-center gap-2 mt-4 text-center">
          <LockKeyhole size={18} className="text-(--foreground)" />
          <p className="text-center text-sm text-(--muted)">
            Acesso restrito aos administradores autorizados.
          </p>
        </div>
      </div>
    </main>
  );
}
