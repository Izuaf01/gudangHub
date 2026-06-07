import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { StockInForm } from "../stock-in-form";

async function getFormData() {
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, unit: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { products, suppliers };
}

export default async function TambahPenerimaanPage() {
  const { products, suppliers } = await getFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Penerimaan"
        description="Catat penerimaan barang baru dari supplier"
      />
      <div className="max-w-2xl">
        <StockInForm products={products} suppliers={suppliers} />
      </div>
    </div>
  );
}
