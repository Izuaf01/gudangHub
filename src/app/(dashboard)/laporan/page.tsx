import { prisma } from "@/lib/prisma";
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
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { subDays } from "date-fns";

async function getReportData() {
  const since30 = subDays(new Date(), 30);
  const since7 = subDays(new Date(), 7);

  const [
    stockInBySupplier,
    qcStats,
    shipmentsByStore,
    topMovingProducts,
    lowStockProducts,
    recentShipments,
  ] = await Promise.all([
    // Stok masuk per supplier (30 hari)
    prisma.stockIn.groupBy({
      by: ["supplierId"],
      where: { receivedAt: { gte: since30 }, status: "DONE" },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
    }),

    // QC reject rate per supplier (30 hari)
    prisma.qualityCheck.findMany({
      where: { checkedAt: { gte: since30 } },
      include: {
        stockIn: {
          include: { supplier: { select: { name: true } } },
        },
      },
    }),

    // Pengiriman per toko
    prisma.shipment.groupBy({
      by: ["storeId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    // Top produk bergerak (7 hari)
    prisma.stockMovement.groupBy({
      by: ["productId"],
      where: { movedAt: { gte: since7 } },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),

    // Produk stok rendah
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        inventories: { select: { quantity: true } },
      },
      take: 100,
    }),

    // Pengiriman terbaru
    prisma.shipment.findMany({
      where: { createdAt: { gte: since30 } },
      include: {
        store: { select: { name: true } },
        order: { select: { orderNo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Enrich supplier names for stockIn
  const supplierIds = stockInBySupplier.map((s) => s.supplierId);
  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true },
  });
  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));

  // Enrich store names for shipments
  const storeIds = shipmentsByStore.map((s) => s.storeId);
  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true, city: true },
  });
  const storeMap = Object.fromEntries(stores.map((s) => [s.id, s]));

  // Enrich product names for top moving
  const productIds = topMovingProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, unit: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Compute QC stats per supplier
  const qcBySupplier: Record<
    string,
    { name: string; total: number; rejected: number }
  > = {};
  for (const qc of qcStats) {
    const sName = qc.stockIn.supplier.name;
    if (!qcBySupplier[sName])
      qcBySupplier[sName] = { name: sName, total: 0, rejected: 0 };
    qcBySupplier[sName].total += qc.passedQty + qc.rejectedQty;
    qcBySupplier[sName].rejected += qc.rejectedQty;
  }

  // Low stock filter
  const lowStock = lowStockProducts
    .map((p) => {
      const totalQty = p.inventories.reduce((s, i) => s + i.quantity, 0);
      return { ...p, totalQty };
    })
    .filter((p) => p.totalQty <= p.minStock)
    .sort((a, b) => a.totalQty - b.totalQty)
    .slice(0, 10);

  return {
    stockInBySupplier: stockInBySupplier.map((s) => ({
      supplierName: supplierMap[s.supplierId] ?? s.supplierId,
      totalQty: s._sum.quantity ?? 0,
      count: s._count.id,
    })),
    qcBySupplier: Object.values(qcBySupplier).sort(
      (a, b) => b.rejected / b.total - a.rejected / a.total,
    ),
    shipmentsByStore: shipmentsByStore.map((s) => ({
      store: storeMap[s.storeId],
      count: s._count.id,
    })),
    topMovingProducts: topMovingProducts.map((p) => ({
      product: productMap[p.productId],
      totalQty: p._sum.quantity ?? 0,
      movements: p._count.id,
    })),
    lowStock,
    recentShipments,
  };
}

export default async function LaporanPage() {
  const data = await getReportData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Laporan"
        description="Ringkasan operasional gudang 30 hari terakhir"
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Stok Masuk per Supplier */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Stok Masuk per Supplier (30 Hari)
            </h3>
            {data.stockInBySupplier.length === 0 ? (
              <p className="text-xs text-mute py-4 text-center">
                Belum ada data
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Penerimaan</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stockInBySupplier.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">
                        {row.supplierName}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.count}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatNumber(row.totalQty)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* QC Reject Rate */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              QC Reject Rate per Supplier (30 Hari)
            </h3>
            {data.qcBySupplier.length === 0 ? (
              <p className="text-xs text-mute py-4 text-center">
                Belum ada data
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">
                      Total Diperiksa
                    </TableHead>
                    <TableHead className="text-right">Ditolak</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.qcBySupplier.map((row, i) => {
                    const rate =
                      row.total > 0
                        ? ((row.rejected / row.total) * 100).toFixed(1)
                        : "0";
                    const isHigh = parseFloat(rate) > 10;
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{row.name}</TableCell>
                        <TableCell className="text-right text-sm">
                          {formatNumber(row.total)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-sale">
                          {formatNumber(row.rejected)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isHigh ? "danger" : "success"}>
                            {rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pengiriman per Toko */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Pengiriman per Toko (Total)
            </h3>
            {data.shipmentsByStore.length === 0 ? (
              <p className="text-xs text-mute py-4 text-center">
                Belum ada data
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Toko</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead className="text-right">Pengiriman</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.shipmentsByStore.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">
                        {row.store?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-mute">
                        {row.store?.city ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {row.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Produk Bergerak */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Top 10 Produk Bergerak (7 Hari)
            </h3>
            {data.topMovingProducts.length === 0 ? (
              <p className="text-xs text-mute py-4 text-center">
                Belum ada data
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topMovingProducts.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span className="font-mono text-xs bg-soft-cloud px-1.5 py-0.5">
                          {row.product?.sku ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.product?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatNumber(row.totalQty)}{" "}
                        <span className="text-mute font-normal text-xs">
                          {row.product?.unit}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stok Rendah */}
      {data.lowStock.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Produk Stok Rendah ({data.lowStock.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Stok Saat Ini</TableHead>
                  <TableHead className="text-right">Minimum</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStock.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {p.sku}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-sm text-mute">
                      {p.category}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatNumber(p.totalQty)} {p.unit}
                    </TableCell>
                    <TableCell className="text-right text-sm text-mute">
                      {formatNumber(p.minStock)} {p.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.totalQty === 0 ? "danger" : "warning"}>
                        {p.totalQty === 0 ? "Habis" : "Rendah"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pengiriman Terbaru */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Pengiriman Terbaru (30 Hari)
          </h3>
          {data.recentShipments.length === 0 ? (
            <p className="text-xs text-mute py-4 text-center">
              Belum ada pengiriman
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentShipments.map((s) => (
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
                    <TableCell className="text-xs text-mute">
                      {formatDate(s.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "DELIVERED"
                            ? "success"
                            : s.status === "IN_TRANSIT"
                              ? "warning"
                              : "default"
                        }
                      >
                        {s.status === "DELIVERED"
                          ? "Terkirim"
                          : s.status === "IN_TRANSIT"
                            ? "Dalam Perjalanan"
                            : s.status === "DEPARTED"
                              ? "Berangkat"
                              : "Siap"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
