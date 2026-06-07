import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { StockInStatus } from "@prisma/client";
import Link from "next/link";

const STATUS_LABEL: Record<StockInStatus, string> = {
  PENDING: "Pending",
  RECEIVING: "Diterima",
  QC: "QC",
  PUTAWAY: "Putaway",
  DONE: "Selesai",
};

const STATUS_VARIANT: Record<
  StockInStatus,
  "default" | "info" | "warning" | "success" | "danger"
> = {
  PENDING: "default",
  RECEIVING: "info",
  QC: "warning",
  PUTAWAY: "info",
  DONE: "success",
};

const ALL_STATUSES: StockInStatus[] = [
  "PENDING",
  "RECEIVING",
  "QC",
  "PUTAWAY",
  "DONE",
];

async function getStockIn(id: string) {
  return prisma.stockIn.findUnique({
    where: { id },
    include: {
      product: true,
      supplier: true,
      qualityChecks: {
        include: { checkedBy: { select: { name: true } } },
        orderBy: { checkedAt: "desc" },
      },
    },
  });
}

export default async function PenerimaanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stockIn = await getStockIn(id);
  if (!stockIn) notFound();

  const qc = stockIn.qualityChecks[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Penerimaan — ${stockIn.invoiceNo ?? stockIn.id.slice(0, 8)}`}
        description="Detail penerimaan barang dari supplier"
        action={
          stockIn.status === "QC" ? (
            <Link href={`/qc/${stockIn.id}`}>
              <button className="btn-primary btn-sm">Proses QC</button>
            </Link>
          ) : null
        }
      />

      {/* Status Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            {ALL_STATUSES.map((s, i) => {
              const isDone =
                ALL_STATUSES.indexOf(stockIn.status) >= ALL_STATUSES.indexOf(s);
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${isDone ? "bg-ink border-ink" : "bg-canvas border-hairline"}`}
                    />
                    <span
                      className={`text-xs ${isDone ? "text-ink font-medium" : "text-mute"}`}
                    >
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  {i < ALL_STATUSES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-stone mb-4" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-medium text-ink">Informasi Barang</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Produk</dt>
                <dd className="text-xs font-medium text-ink">
                  {stockIn.product.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">SKU</dt>
                <dd className="font-mono text-xs">{stockIn.product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Kuantitas</dt>
                <dd className="text-xs font-medium">
                  {formatNumber(stockIn.quantity)} {stockIn.product.unit}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Harga Satuan</dt>
                <dd className="text-xs">{formatCurrency(stockIn.unitCost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Total Nilai</dt>
                <dd className="text-xs font-medium">
                  {formatCurrency(stockIn.quantity * stockIn.unitCost)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-medium text-ink">Informasi Supplier</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Supplier</dt>
                <dd className="text-xs font-medium">{stockIn.supplier.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">No. Invoice</dt>
                <dd className="text-xs font-mono">
                  {stockIn.invoiceNo ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Tanggal Terima</dt>
                <dd className="text-xs">
                  {formatDateTime(stockIn.receivedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-mute">Status</dt>
                <dd>
                  <Badge variant={STATUS_VARIANT[stockIn.status]}>
                    {STATUS_LABEL[stockIn.status]}
                  </Badge>
                </dd>
              </div>
            </dl>
            {stockIn.notes && (
              <div className="pt-2 border-t border-hairline-soft">
                <p className="text-xs text-mute mb-1">Catatan</p>
                <p className="text-xs text-ink">{stockIn.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QC Result */}
      {qc && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-medium text-ink">
              Hasil Quality Control
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-soft-cloud p-4">
                <p className="text-xs text-mute mb-1">Lolos QC</p>
                <p className="text-2xl font-medium text-success">
                  {formatNumber(qc.passedQty)}
                </p>
              </div>
              <div className="bg-soft-cloud p-4">
                <p className="text-xs text-mute mb-1">Ditolak</p>
                <p className="text-2xl font-medium text-sale">
                  {formatNumber(qc.rejectedQty)}
                </p>
              </div>
              <div className="bg-soft-cloud p-4">
                <p className="text-xs text-mute mb-1">Tingkat Lolos</p>
                <p className="text-2xl font-medium text-ink">
                  {qc.passedQty + qc.rejectedQty > 0
                    ? Math.round(
                        (qc.passedQty / (qc.passedQty + qc.rejectedQty)) * 100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
            {qc.notes && (
              <div className="pt-2 border-t border-hairline-soft">
                <p className="text-xs text-mute mb-1">Catatan QC</p>
                <p className="text-xs text-ink">{qc.notes}</p>
              </div>
            )}
            <p className="text-xs text-mute">
              Diperiksa oleh {qc.checkedBy.name} —{" "}
              {formatDateTime(qc.checkedAt)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
