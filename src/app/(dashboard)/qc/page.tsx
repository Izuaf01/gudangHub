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
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

async function getQcItems() {
  return prisma.stockIn.findMany({
    where: { status: "QC" },
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { receivedAt: "asc" },
  });
}

async function getRecentQc() {
  return prisma.qualityCheck.findMany({
    take: 10,
    orderBy: { checkedAt: "desc" },
    include: {
      stockIn: {
        include: {
          product: { select: { name: true, sku: true } },
          supplier: { select: { name: true } },
        },
      },
      checkedBy: { select: { name: true } },
    },
  });
}

export default async function QcPage() {
  const [pending, recent] = await Promise.all([getQcItems(), getRecentQc()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control"
        description={`${pending.length} item menunggu pemeriksaan`}
      />

      {/* Pending QC */}
      <div>
        <h2 className="text-sm font-medium text-ink mb-3">
          Menunggu Pemeriksaan
        </h2>
        <Card>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShieldCheck className="h-10 w-10 text-success mb-3" />
              <p className="text-sm font-medium text-ink">
                Semua item sudah diperiksa
              </p>
              <p className="text-xs text-mute mt-1">
                Tidak ada barang yang menunggu QC
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Tanggal Terima</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-medium text-ink">
                        {item.product.name}
                      </span>
                      <p className="text-xs text-mute font-mono mt-0.5">
                        {item.product.sku}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-mute">
                      {item.supplier.name}
                    </TableCell>
                    <TableCell>
                      {item.invoiceNo ? (
                        <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                          {item.invoiceNo}
                        </span>
                      ) : (
                        <span className="text-mute text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(item.quantity)}{" "}
                      <span className="text-mute font-normal text-xs">
                        {item.product.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-mute">
                      {formatDateTime(item.receivedAt)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/qc/${item.id}`}>
                        <button className="btn-primary btn-sm">Periksa</button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Recent QC */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink mb-3">
            Riwayat Pemeriksaan
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Lolos</TableHead>
                  <TableHead className="text-right">Ditolak</TableHead>
                  <TableHead>Tingkat Lolos</TableHead>
                  <TableHead>Diperiksa Oleh</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((qc) => {
                  const total = qc.passedQty + qc.rejectedQty;
                  const rate =
                    total > 0 ? Math.round((qc.passedQty / total) * 100) : 0;
                  return (
                    <TableRow key={qc.id}>
                      <TableCell>
                        <span className="font-medium text-ink text-sm">
                          {qc.stockIn.product.name}
                        </span>
                        <p className="text-xs text-mute font-mono">
                          {qc.stockIn.product.sku}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-mute">
                        {qc.stockIn.supplier.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-success font-medium text-sm">
                          {formatNumber(qc.passedQty)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sale font-medium text-sm">
                          {formatNumber(qc.rejectedQty)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rate >= 90
                              ? "success"
                              : rate >= 70
                                ? "warning"
                                : "danger"
                          }
                        >
                          {rate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-mute">
                        {qc.checkedBy.name}
                      </TableCell>
                      <TableCell className="text-xs text-mute">
                        {formatDateTime(qc.checkedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
