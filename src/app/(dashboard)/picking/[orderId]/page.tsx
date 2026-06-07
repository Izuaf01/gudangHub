import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PickingForm } from "../picking-form";

async function getPickingData(orderId: string) {
  const task = await prisma.pickingTask.findFirst({
    where: { orderId },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: {
            include: {
              product: {
                include: {
                  inventories: {
                    where: { quantity: { gt: 0 } },
                    include: {
                      location: { select: { code: true, zone: true } },
                    },
                    orderBy: { quantity: "desc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return task;
}

export default async function PickingDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const task = await getPickingData(orderId);
  if (!task) notFound();

  const items = task.order.items.map((item) => ({
    id: item.id,
    requestedQty: item.requestedQty,
    pickedQty: item.pickedQty,
    product: {
      name: item.product.name,
      sku: item.product.sku,
      unit: item.product.unit,
      inventories: item.product.inventories.map((inv) => ({
        id: inv.id,
        quantity: inv.quantity,
        location: { code: inv.location.code, zone: inv.location.zone },
      })),
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Picking — ${task.order.orderNo}`}
        description={`${task.order.store.name}, ${task.order.store.city}`}
      />
      <div className="max-w-3xl">
        <PickingForm
          orderId={task.orderId}
          taskStatus={task.status}
          items={items}
        />
      </div>
    </div>
  );
}
