import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name: string; email: string; role: string };

  return (
    <div className="min-h-screen bg-soft-cloud">
      <Sidebar />
      <Topbar userName={user.name ?? user.email} userRole={user.role} />
      <main
        className="transition-all"
        style={{
          marginLeft: "var(--sidebar-width)",
          paddingTop: "var(--topbar-height)",
        }}
      >
        <div className="p-6 max-w-screen-2xl">
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
