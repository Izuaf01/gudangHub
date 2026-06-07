import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { OrderForm } from "../order-form";

async function getFormData() {
  const [products, stores] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { inventories: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      totalStock: p.inventories.reduce((s, i) => s + i.quantity, 0),
    })),
    stores,
  };
}

export default async function BuatPesananPage() {
  const { products, stores } = await getFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Pesanan"
        description="Buat pesanan baru untuk toko"
      />
      <div className="max-w-3xl">
        <OrderForm products={products} stores={stores} />
      </div>
    </div>
  );
}
