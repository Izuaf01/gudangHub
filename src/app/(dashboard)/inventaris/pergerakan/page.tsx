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
import type { MovementType } from "@prisma/client";

const TYPE_LABEL: Record<MovementType, string> = {
  IN: "Masuk",
  OUT: "Keluar",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Penyesuaian",
};

const TYPE_VARIANT: Record<
  MovementType,
  "success" | "danger" | "info" | "warning"
> = {
  IN: "success",
  OUT: "danger",
  TRANSFER: "info",
  ADJUSTMENT: "warning",
};

async function getMovements() {
  return prisma.stockMovement.findMany({
    take: 100,
    orderBy: { movedAt: "desc" },
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      fromLocation: { select: { code: true } },
      toLocation: { select: { code: true } },
      movedBy: { select: { name: true } },
    },
  });
}

export default async function PergerakanPage() {
  const movements = await getMovements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pergerakan Stok"
        description={`${movements.length} pergerakan terakhir`}
      />

      <Card>
        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-medium text-ink">
              Belum ada pergerakan stok
            </p>
            <p className="text-xs text-mute mt-1">
              Pergerakan stok akan muncul setelah proses QC selesai
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Dari Lokasi</TableHead>
                <TableHead>Ke Lokasi</TableHead>
                <TableHead>Oleh</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium text-ink text-sm">
                      {m.product.name}
                    </p>
                    <p className="font-mono text-xs text-mute mt-0.5">
                      {m.product.sku}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TYPE_VARIANT[m.type]}>
                      {TYPE_LABEL[m.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        m.type === "IN" || m.type === "TRANSFER"
                          ? "text-success"
                          : "text-sale"
                      }
                    >
                      {m.type === "OUT" ? "-" : "+"}
                      {formatNumber(m.quantity)}
                    </span>{" "}
                    <span className="text-xs text-mute font-normal">
                      {m.product.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    {m.fromLocation ? (
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {m.fromLocation.code}
                      </span>
                    ) : (
                      <span className="text-mute text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {m.toLocation ? (
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {m.toLocation.code}
                      </span>
                    ) : (
                      <span className="text-mute text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-mute">
                    {m.movedBy.name}
                  </TableCell>
                  <TableCell className="text-xs text-mute">
                    {formatDateTime(m.movedAt)}
                  </TableCell>
                  <TableCell className="text-xs text-mute max-w-50 truncate">
                    {m.notes ?? "—"}
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
