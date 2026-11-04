"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao sair.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Não foi possível sair.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-(--border) px-4 py-2 text-sm 
                    font-medium text-(--foreground) transition 
                    hover:bg-(--surface) disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut size={16} />
        {loading ? "Saindo..." : "Sair"}
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
