export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--foreground)">Dashboard</h1>

        <p className="mt-2 text-sm text-(--muted)">
          Bem-vindo ao painel administrativo da S.A Smart.
        </p>
      </div>

      <div className="rounded-xl border border-(--border) bg-(--surface) p-6">
        <h2 className="font-semibold text-(--foreground)">
          Painel em desenvolvimento
        </h2>

        <p className="mt-2 text-sm text-(--muted)">
          Em breve você poderá gerenciar produtos, categorias, marcas e usuários
          por aqui.
        </p>
      </div>
    </div>
  );
}
