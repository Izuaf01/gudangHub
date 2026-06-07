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
import { formatDateTime } from "@/lib/utils";
import { Truck } from "lucide-react";
import Link from "next/link";
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

async function getShipments() {
  return prisma.shipment.findMany({
    include: {
      order: {
        include: {
          items: { select: { id: true } },
        },
      },
      store: { select: { name: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export default async function PengirimanPage() {
  const shipments = await getShipments();
  const active = shipments.filter((s) => s.status !== "DELIVERED");
  const delivered = shipments.filter((s) => s.status === "DELIVERED");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengiriman"
        description={`${active.length} pengiriman aktif`}
        action={
          <Link href="/pengiriman/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Buat Pengiriman
            </button>
          </Link>
        }
      />

      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink mb-3">
            Pengiriman Aktif
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Est. Tiba</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {s.order.orderNo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{s.store.name}</p>
                      <p className="text-xs text-mute">{s.store.city}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {s.vehicleNo ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-mute">
                      {s.estimatedArrival
                        ? formatDateTime(s.estimatedArrival)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[s.status]}>
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/pengiriman/${s.id}`}>
                        <button className="btn-secondary btn-sm">Detail</button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {active.length === 0 && delivered.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-20">
            <Truck className="h-12 w-12 text-stone mb-4" />
            <p className="text-sm font-medium text-ink mb-1">
              Belum ada pengiriman
            </p>
            <p className="text-xs text-mute">
              Buat pengiriman dari pesanan yang sudah siap
            </p>
          </div>
        </Card>
      )}

      {delivered.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink mb-3">
            Terkirim ({delivered.length})
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Dikirim</TableHead>
                  <TableHead>Tiba</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {delivered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {s.order.orderNo}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{s.store.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {s.vehicleNo ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.driverName ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-mute">
                      {s.departedAt ? formatDateTime(s.departedAt) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-mute">
                      {s.deliveredAt ? formatDateTime(s.deliveredAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/pengiriman/${s.id}`}>
                        <button className="btn-ghost btn-sm">Detail</button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
