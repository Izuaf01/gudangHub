import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatNumber } from "@/lib/utils";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Dikonfirmasi",
  PICKING: "Picking",
  PACKING: "Packing",
  READY: "Siap Kirim",
  SHIPPED: "Dikirim",
};

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "info" | "warning" | "success" | "danger"
> = {
  DRAFT: "default",
  CONFIRMED: "info",
  PICKING: "warning",
  PACKING: "warning",
  READY: "success",
  SHIPPED: "success",
};

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      store: true,
      items: {
        include: {
          product: {
            include: {
              inventories: {
                include: { location: { select: { code: true } } },
                where: { quantity: { gt: 0 } },
              },
            },
          },
        },
      },
      pickingTask: { include: { assignedTo: { select: { name: true } } } },
      packingTask: { include: { assignedTo: { select: { name: true } } } },
      shipment: true,
    },
  });
}

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNo}
        description={`Pesanan untuk ${order.store.name}`}
        action={
          order.status === "PICKING" ? (
            <Link href={`/picking/${order.id}`}>
              <button className="btn-primary btn-sm">Proses Picking</button>
            </Link>
          ) : order.status === "PACKING" ? (
            <Link href={`/packing/${order.id}`}>
              <button className="btn-primary btn-sm">Proses Packing</button>
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-sm font-medium text-ink">Info Pesanan</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Toko</dt>
                <dd className="text-xs font-medium">{order.store.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Kota</dt>
                <dd className="text-xs text-ink">{order.store.city}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Status</dt>
                <dd>
                  <Badge variant={STATUS_VARIANT[order.status]}>
                    {STATUS_LABEL[order.status]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Prioritas</dt>
                <dd>
                  {order.priority === "URGENT" ? (
                    <Badge variant="danger">Urgent</Badge>
                  ) : (
                    <Badge variant="default">Normal</Badge>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Dibuat</dt>
                <dd className="text-xs">{formatDateTime(order.createdAt)}</dd>
              </div>
              {order.scheduledShipAt && (
                <div className="flex justify-between">
                  <dt className="text-xs text-mute">Jadwal Kirim</dt>
                  <dd className="text-xs">
                    {formatDateTime(order.scheduledShipAt)}
                  </dd>
                </div>
              )}
            </dl>
            {order.notes && (
              <div className="pt-2 border-t border-hairline-soft">
                <p className="text-xs text-mute mb-1">Catatan</p>
                <p className="text-xs">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-sm font-medium text-ink">Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-hairline-soft">
                <span className="text-xs text-mute">Picking</span>
                {order.pickingTask ? (
                  <Badge
                    variant={
                      order.pickingTask.status === "COMPLETED"
                        ? "success"
                        : "warning"
                    }
                  >
                    {order.pickingTask.status === "COMPLETED"
                      ? "Selesai"
                      : "Berlangsung"}
                  </Badge>
                ) : (
                  <Badge variant="default">Belum</Badge>
                )}
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-mute">Packing</span>
                {order.packingTask ? (
                  <Badge
                    variant={
                      order.packingTask.status === "COMPLETED"
                        ? "success"
                        : "warning"
                    }
                  >
                    {order.packingTask.status === "COMPLETED"
                      ? "Selesai"
                      : "Berlangsung"}
                  </Badge>
                ) : (
                  <Badge variant="default">Belum</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink mb-4">Item Pesanan</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Qty Diminta</TableHead>
                <TableHead className="text-right">Qty Dipick</TableHead>
                <TableHead>Lokasi Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const isPicked = item.pickedQty >= item.requestedQty;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {item.product.sku}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.requestedQty)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          isPicked ? "text-success font-medium" : "text-mute"
                        }
                      >
                        {formatNumber(item.pickedQty)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.product.inventories.slice(0, 3).map((inv) => (
                          <span
                            key={inv.id}
                            className="font-mono text-xs bg-soft-cloud px-1.5 py-0.5"
                          >
                            {inv.location.code} ({formatNumber(inv.quantity)})
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
