import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Boxes,
  PackageOpen,
  ClipboardList,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { StockInStatus, OrderStatus } from "@prisma/client";
import Link from "next/link";

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalProducts,
    totalStockResult,
    stockInToday,
    pendingOrders,
    shipmentsToday,
    lowStockProducts,
    recentOrders,
    recentStockIn,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.inventory.aggregate({ _sum: { quantity: true } }),
    prisma.stockIn.count({
      where: { receivedAt: { gte: today, lt: tomorrow } },
    }),
    prisma.order.count({
      where: {
        status: {
          in: [
            OrderStatus.DRAFT,
            OrderStatus.CONFIRMED,
            OrderStatus.PICKING,
            OrderStatus.PACKING,
          ],
        },
      },
    }),
    prisma.shipment.count({
      where: { createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.product
      .findMany({
        where: { isActive: true },
        include: { inventories: { select: { quantity: true } } },
        orderBy: { name: "asc" },
      })
      .then((products) =>
        products.filter((p) => {
          const total = p.inventories.reduce((s, i) => s + i.quantity, 0);
          return total <= p.minStock && p.minStock > 0;
        }),
      ),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { store: { select: { name: true } } },
    }),
    prisma.stockIn.findMany({
      take: 5,
      orderBy: { receivedAt: "desc" },
      include: {
        product: { select: { name: true, unit: true } },
        supplier: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalProducts,
    totalStock: totalStockResult._sum.quantity ?? 0,
    stockInToday,
    pendingOrders,
    shipmentsToday,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 5),
    recentOrders,
    recentStockIn,
  };
}

const orderStatusLabel: Record<string, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Dikonfirmasi",
  PICKING: "Picking",
  PACKING: "Packing",
  READY: "Siap Kirim",
  SHIPPED: "Terkirim",
};

const orderStatusVariant: Record<
  string,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  DRAFT: "default",
  CONFIRMED: "info",
  PICKING: "warning",
  PACKING: "warning",
  READY: "success",
  SHIPPED: "success",
};

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats();
  const user = session?.user as { name: string };

  const kpiItems = [
    {
      label: "Total Produk Aktif",
      value: formatNumber(stats.totalProducts),
      icon: Package,
      href: "/produk",
    },
    {
      label: "Total Stok",
      value: formatNumber(stats.totalStock),
      icon: Boxes,
      href: "/inventaris",
    },
    {
      label: "Penerimaan Hari Ini",
      value: formatNumber(stats.stockInToday),
      icon: PackageOpen,
      href: "/penerimaan",
    },
    {
      label: "Pesanan Pending",
      value: formatNumber(stats.pendingOrders),
      icon: ClipboardList,
      href: "/pesanan",
      alert: stats.pendingOrders > 0,
    },
    {
      label: "Pengiriman Hari Ini",
      value: formatNumber(stats.shipmentsToday),
      icon: Truck,
      href: "/pengiriman",
    },
    {
      label: "Stok Hampir Habis",
      value: formatNumber(stats.lowStockCount),
      icon: AlertTriangle,
      href: "/inventaris",
      alert: stats.lowStockCount > 0,
      danger: stats.lowStockCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Selamat datang, ${user?.name ?? ""}!`}
        description="Ringkasan operasional gudang hari ini"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <Card className="hover:border-hairline transition-colors cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-9 h-9 flex items-center justify-center ${
                        item.danger ? "bg-red-100" : "bg-soft-cloud"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 ${item.danger ? "text-sale" : "text-ink"}`}
                      />
                    </div>
                    {item.alert && (
                      <span className="w-2 h-2 rounded-full bg-sale animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-2xl font-medium ${item.danger ? "text-sale" : "text-ink"}`}
                  >
                    {item.value}
                  </p>
                  <p className="text-xs text-mute mt-1">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline-soft">
            <h2 className="text-sm font-medium text-ink">Pesanan Terbaru</h2>
            <Link
              href="/pesanan"
              className="text-xs text-mute hover:text-ink transition-colors"
            >
              Lihat semua →
            </Link>
          </div>
          <div>
            {stats.recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ClipboardList className="h-8 w-8 text-stone mx-auto mb-2" />
                <p className="text-sm text-mute">Belum ada pesanan</p>
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/pesanan/${order.id}`}
                  className="flex items-center justify-between px-6 py-3.5 border-b border-hairline-soft last:border-0 hover:bg-soft-cloud transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {order.orderNo}
                    </p>
                    <p className="text-xs text-mute mt-0.5">
                      {order.store.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={orderStatusVariant[order.status] ?? "default"}
                    >
                      {orderStatusLabel[order.status] ?? order.status}
                    </Badge>
                    <p className="text-xs text-stone">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent Stock In */}
        <Card>
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline-soft">
            <h2 className="text-sm font-medium text-ink">Penerimaan Terbaru</h2>
            <Link
              href="/penerimaan"
              className="text-xs text-mute hover:text-ink transition-colors"
            >
              Lihat semua →
            </Link>
          </div>
          <div>
            {stats.recentStockIn.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <PackageOpen className="h-8 w-8 text-stone mx-auto mb-2" />
                <p className="text-sm text-mute">Belum ada penerimaan</p>
              </div>
            ) : (
              stats.recentStockIn.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-3.5 border-b border-hairline-soft last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-mute mt-0.5">
                      {item.supplier.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-medium text-ink">
                      +{formatNumber(item.quantity)} {item.product.unit}
                    </p>
                    <p className="text-xs text-stone">
                      {formatDateTime(item.receivedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-hairline-soft">
            <AlertTriangle className="h-4 w-4 text-sale" />
            <h2 className="text-sm font-medium text-ink">
              Peringatan Stok Hampir Habis
            </h2>
            <Badge variant="danger" className="ml-auto">
              {stats.lowStockCount} produk
            </Badge>
          </div>
          <div className="divide-y divide-hairline-soft">
            {stats.lowStockProducts.map((product) => {
              const totalStock = product.inventories.reduce(
                (s, i) => s + i.quantity,
                0,
              );
              return (
                <Link
                  key={product.id}
                  href={`/produk/${product.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-soft-cloud transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {product.name}
                    </p>
                    <p className="text-xs text-mute mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-sale">
                        {formatNumber(totalStock)} {product.unit}
                      </p>
                      <p className="text-xs text-mute">
                        Min: {formatNumber(product.minStock)}
                      </p>
                    </div>
                    <TrendingDown className="h-4 w-4 text-sale" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
