import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, formatNumber, formatCurrency } from "@/lib/utils";
import { QcForm } from "../qc-form";

async function getStockIn(id: string) {
  return prisma.stockIn.findUnique({
    where: { id, status: "QC" },
    include: {
      product: true,
      supplier: true,
    },
  });
}

export default async function QcDetailPage({
  params,
}: {
  params: Promise<{ stockInId: string }>;
}) {
  const { stockInId } = await params;
  const stockIn = await getStockIn(stockInId);
  if (!stockIn) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemeriksaan QC"
        description={`${stockIn.product.name} — ${stockIn.supplier.name}`}
      />

      {/* Item Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-mute mb-1">Produk</p>
              <p className="text-sm font-medium text-ink">
                {stockIn.product.name}
              </p>
              <p className="text-xs text-mute font-mono mt-0.5">
                {stockIn.product.sku}
              </p>
            </div>
            <div>
              <p className="text-xs text-mute mb-1">Supplier</p>
              <p className="text-sm font-medium text-ink">
                {stockIn.supplier.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-mute mb-1">Kuantitas Diterima</p>
              <p className="text-sm font-medium text-ink">
                {formatNumber(stockIn.quantity)} {stockIn.product.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-mute mb-1">Nilai Total</p>
              <p className="text-sm font-medium text-ink">
                {formatCurrency(stockIn.quantity * stockIn.unitCost)}
              </p>
            </div>
          </div>
          {stockIn.invoiceNo && (
            <div className="mt-4 pt-4 border-t border-hairline-soft">
              <p className="text-xs text-mute mb-1">No. Invoice</p>
              <p className="font-mono text-sm">{stockIn.invoiceNo}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-hairline-soft">
            <p className="text-xs text-mute mb-1">Tanggal Terima</p>
            <p className="text-sm">{formatDateTime(stockIn.receivedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* QC Form */}
      <div className="max-w-2xl">
        <h2 className="text-sm font-medium text-ink mb-3">Hasil Pemeriksaan</h2>
        <QcForm stockInId={stockIn.id} totalQty={stockIn.quantity} />
      </div>
    </div>
  );
}
