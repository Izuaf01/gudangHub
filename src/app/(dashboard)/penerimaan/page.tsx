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
import { formatDateTime, formatCurrency, formatNumber } from "@/lib/utils";
import { PackageOpen, Plus } from "lucide-react";
import Link from "next/link";
import { StockInActions } from "./stock-in-actions";
import type { StockInStatus } from "@prisma/client";

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

async function getStockIns() {
  return prisma.stockIn.findMany({
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      supplier: { select: { name: true } },
      qualityChecks: {
        select: { passedQty: true, rejectedQty: true },
        take: 1,
      },
    },
    orderBy: { receivedAt: "desc" },
    take: 100,
  });
}

export default async function PenerimaanPage() {
  const stockIns = await getStockIns();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penerimaan Barang"
        description={`${stockIns.length} penerimaan`}
        action={
          <Link href="/penerimaan/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Penerimaan
            </button>
          </Link>
        }
      />

      <Card>
        {stockIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PackageOpen className="h-10 w-10 text-stone mb-3" />
            <p className="text-sm font-medium text-ink">Belum ada penerimaan</p>
            <p className="text-xs text-mute mt-1">
              Mulai dengan menambahkan penerimaan barang pertama
            </p>
            <Link href="/penerimaan/baru">
              <button className="btn-primary btn-sm mt-5">
                Tambah Penerimaan
              </button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead>Tanggal Terima</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockIns.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.invoiceNo ? (
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {item.invoiceNo}
                      </span>
                    ) : (
                      <span className="text-mute text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/penerimaan/${item.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-mute mt-0.5 font-mono">
                      {item.product.sku}
                    </p>
                  </TableCell>
                  <TableCell className="text-mute text-sm">
                    {item.supplier.name}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(item.quantity)}{" "}
                    <span className="text-mute font-normal text-xs">
                      {item.product.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(item.unitCost)}
                  </TableCell>
                  <TableCell className="text-sm text-mute">
                    {formatDateTime(item.receivedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[item.status]}>
                      {STATUS_LABEL[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StockInActions
                      stockInId={item.id}
                      currentStatus={item.status}
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
