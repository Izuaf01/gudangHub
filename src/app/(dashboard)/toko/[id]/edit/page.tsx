import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TokoForm } from "../../toko-form";

export default async function EditTokoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Toko"
        description={`Mengubah data ${store.name}`}
      />
      <div className="max-w-xl">
        <TokoForm
          storeId={store.id}
          defaultValues={{
            name: store.name,
            address: store.address,
            city: store.city,
            contactPerson: store.contactPerson ?? "",
            phone: store.phone ?? "",
          }}
        />
      </div>
    </div>
  );
}
