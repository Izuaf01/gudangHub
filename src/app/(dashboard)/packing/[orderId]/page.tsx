import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PackingDetailForm } from "../packing-form";

async function getPackingData(orderId: string) {
  const task = await prisma.packingTask.findFirst({
    where: { orderId },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: {
            include: {
              product: {
                select: { name: true, sku: true, unit: true },
              },
            },
          },
        },
      },
    },
  });
  return task;
}

export default async function PackingDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const task = await getPackingData(orderId);
  if (!task) notFound();

  const items = task.order.items.map((item) => ({
    id: item.id,
    requestedQty: item.requestedQty,
    pickedQty: item.pickedQty,
    product: {
      name: item.product.name,
      sku: item.product.sku,
      unit: item.product.unit,
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Packing — ${task.order.orderNo}`}
        description={`${task.order.store.name}, ${task.order.store.city}`}
      />
      <div className="max-w-3xl">
        <PackingDetailForm orderId={task.orderId} items={items} />
      </div>
    </div>
  );
}
