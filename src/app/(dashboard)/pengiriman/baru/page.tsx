import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ShipmentForm } from "../shipment-form";

async function getReadyOrders() {
  const orders = await prisma.order.findMany({
    where: { status: "READY", shipment: null },
    include: {
      store: { select: { name: true, city: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    store: o.store,
    itemCount: o.items.length,
  }));
}

export default async function BuatPengirimanPage() {
  const readyOrders = await getReadyOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Pengiriman"
        description="Buat surat jalan untuk pesanan yang siap dikirim"
      />
      <div className="max-w-2xl">
        <ShipmentForm readyOrders={readyOrders} />
      </div>
    </div>
  );
}
