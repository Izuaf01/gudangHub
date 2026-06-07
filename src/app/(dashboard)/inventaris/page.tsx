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
import { formatNumber } from "@/lib/utils";
import { Boxes } from "lucide-react";

async function getInventory() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      inventories: {
        include: { location: { select: { code: true, zone: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => ({
    ...p,
    totalStock: p.inventories.reduce((s, i) => s + i.quantity, 0),
  }));
}

export default async function InventarisPage() {
  const products = await getInventory();
  const lowStockCount = products.filter(
    (p) => p.totalStock <= p.minStock && p.minStock > 0,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Sekarang"
        description={`${products.length} produk · ${lowStockCount > 0 ? `${lowStockCount} hampir habis` : "semua aman"}`}
      />

      {lowStockCount > 0 && (
        <div className="p-4 border border-sale bg-canvas flex items-center gap-3">
          <Boxes className="h-4 w-4 text-sale shrink-0" />
          <p className="text-sm text-sale font-medium">
            {lowStockCount} produk memiliki stok di bawah minimum. Segera
            lakukan pemesanan ulang.
          </p>
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Stok Total</TableHead>
              <TableHead className="text-right">Min Stok</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLow =
                product.totalStock <= product.minStock && product.minStock > 0;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-ink text-sm">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-mute mt-0.5 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${isLow ? "text-sale" : "text-ink"}`}
                    >
                      {formatNumber(product.totalStock)}
                    </span>{" "}
                    <span className="text-mute text-xs">{product.unit}</span>
                  </TableCell>
                  <TableCell className="text-right text-mute text-sm">
                    {formatNumber(product.minStock)}
                  </TableCell>
                  <TableCell>
                    {product.inventories.length === 0 ? (
                      <span className="text-xs text-mute">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {product.inventories
                          .filter((inv) => inv.quantity > 0)
                          .slice(0, 3)
                          .map((inv) => (
                            <span
                              key={inv.id}
                              className="font-mono text-xs bg-soft-cloud px-1.5 py-0.5"
                            >
                              {inv.location.code} ({formatNumber(inv.quantity)})
                            </span>
                          ))}
                        {product.inventories.filter((i) => i.quantity > 0)
                          .length > 3 && (
                          <span className="text-xs text-mute">
                            +
                            {product.inventories.filter((i) => i.quantity > 0)
                              .length - 3}{" "}
                            lagi
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isLow ? (
                      <Badge variant="danger">Hampir Habis</Badge>
                    ) : product.totalStock === 0 ? (
                      <Badge variant="danger">Habis</Badge>
                    ) : (
                      <Badge variant="success">Aman</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
