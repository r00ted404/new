import Link from "next/link";
import Image from "next/image";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-black text-white">
      <aside className="border-r border-white/10 p-4 space-y-6 bg-black/80">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={90} height={24} />
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link className="hover:underline" href="/admin">
            Dashboard
          </Link>
          <Link className="hover:underline" href="/admin/crm">
            User Sessions CRM
          </Link>
        </nav>
        <form action="/api/auth/logout" method="post">
          <button
            className="text-sm text-white/80 hover:text-white"
            type="submit"
          >
            Logout
          </button>
        </form>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
