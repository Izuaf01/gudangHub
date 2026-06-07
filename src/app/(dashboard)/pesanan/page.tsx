import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
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
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { OrderActions } from "./order-actions";
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

async function getOrders() {
  return prisma.order.findMany({
    include: {
      store: { select: { name: true, city: true } },
      items: { select: { requestedQty: true, pickedQty: true } },
      pickingTask: { select: { status: true } },
      packingTask: { select: { status: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export default async function PesananPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesanan"
        description={`${orders.length} pesanan`}
        action={
          <Link href="/pesanan/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buat Pesanan
            </button>
          </Link>
        }
      />

      <Card>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ClipboardList className="h-10 w-10 text-stone mb-3" />
            <p className="text-sm font-medium text-ink">Belum ada pesanan</p>
            <p className="text-xs text-mute mt-1">
              Buat pesanan pertama untuk memulai
            </p>
            <Link href="/pesanan/baru">
              <button className="btn-primary btn-sm mt-5">Buat Pesanan</button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Pesanan</TableHead>
                <TableHead>Toko</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead className="text-right">Jumlah Item</TableHead>
                <TableHead>Jadwal Kirim</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/pesanan/${order.id}`}
                      className="font-mono text-xs bg-soft-cloud px-2 py-0.5 hover:underline"
                    >
                      {order.orderNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-ink text-sm">
                      {order.store.name}
                    </p>
                    <p className="text-xs text-mute">{order.store.city}</p>
                  </TableCell>
                  <TableCell>
                    {order.priority === "URGENT" ? (
                      <Badge variant="danger">Urgent</Badge>
                    ) : (
                      <Badge variant="default">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(order.items.length)}{" "}
                    <span className="text-mute font-normal text-xs">item</span>
                  </TableCell>
                  <TableCell className="text-sm text-mute">
                    {order.scheduledShipAt
                      ? formatDateTime(order.scheduledShipAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-mute">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status]}>
                      {STATUS_LABEL[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <OrderActions
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
