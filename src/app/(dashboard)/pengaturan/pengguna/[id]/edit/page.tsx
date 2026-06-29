import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UserForm } from "../../user-form";

export default async function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Pengguna"
        description={`Mengubah data ${user.name}`}
      />
      <div className="max-w-xl">
        <UserForm
          mode="edit"
          userId={user.id}
          defaultValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
          }}
        />
      </div>
    </div>
  );
}
