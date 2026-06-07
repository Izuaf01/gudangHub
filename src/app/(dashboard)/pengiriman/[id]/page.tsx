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
import { ShipmentStatusButton } from "../shipment-status-button";
import type { ShipmentStatus } from "@prisma/client";

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  READY: "Siap",
  DEPARTED: "Berangkat",
  IN_TRANSIT: "Dalam Perjalanan",
  DELIVERED: "Terkirim",
};

const STATUS_VARIANT: Record<
  ShipmentStatus,
  "default" | "info" | "warning" | "success"
> = {
  READY: "default",
  DEPARTED: "info",
  IN_TRANSIT: "warning",
  DELIVERED: "success",
};

async function getShipment(id: string) {
  return prisma.shipment.findUnique({
    where: { id },
    include: {
      store: true,
      order: {
        include: {
          items: {
            include: {
              product: { select: { name: true, sku: true, unit: true } },
            },
          },
        },
      },
    },
  });
}

export default async function PengirimanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await getShipment(id);
  if (!shipment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pengiriman — ${shipment.order.orderNo}`}
        description={`${shipment.store.name}, ${shipment.store.city}`}
        action={
          <ShipmentStatusButton
            shipmentId={shipment.id}
            currentStatus={shipment.status}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-sm font-medium text-ink">Detail Pengiriman</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Status</dt>
                <dd>
                  <Badge variant={STATUS_VARIANT[shipment.status]}>
                    {STATUS_LABEL[shipment.status]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">No. Kendaraan</dt>
                <dd className="font-mono text-xs font-medium">
                  {shipment.vehicleNo ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Driver</dt>
                <dd className="text-xs">{shipment.driverName ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Est. Tiba</dt>
                <dd className="text-xs">
                  {shipment.estimatedArrival
                    ? formatDateTime(shipment.estimatedArrival)
                    : "—"}
                </dd>
              </div>
            </dl>
            {shipment.notes && (
              <div className="pt-2 border-t border-hairline-soft">
                <p className="text-xs text-mute mb-1">Catatan</p>
                <p className="text-xs">{shipment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-sm font-medium text-ink">Timeline</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Dibuat</dt>
                <dd className="text-xs">
                  {formatDateTime(shipment.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Berangkat</dt>
                <dd className="text-xs">
                  {shipment.departedAt
                    ? formatDateTime(shipment.departedAt)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Tiba</dt>
                <dd className="text-xs">
                  {shipment.deliveredAt
                    ? formatDateTime(shipment.deliveredAt)
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink mb-4">Isi Pengiriman</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Qty Diminta</TableHead>
                <TableHead className="text-right">Qty Dipick</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipment.order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                      {item.product.sku}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {item.product.name}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatNumber(item.requestedQty)} {item.product.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span
                      className={
                        item.pickedQty >= item.requestedQty
                          ? "text-success font-medium"
                          : "text-sale"
                      }
                    >
                      {formatNumber(item.pickedQty)} {item.product.unit}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
