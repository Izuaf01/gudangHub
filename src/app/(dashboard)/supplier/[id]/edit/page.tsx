import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierForm } from "../../supplier-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/supplier">
          <button className="btn-icon">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <PageHeader title="Edit Supplier" description={supplier.name} />
      </div>
      <SupplierForm
        defaultValues={{
          name: supplier.name,
          contact: supplier.contact ?? "",
          address: supplier.address ?? "",
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
        }}
        supplierId={id}
      />
    </div>
  );
}
