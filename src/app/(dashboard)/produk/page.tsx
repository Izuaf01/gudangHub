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
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { ProductActions } from "./product-actions";

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      inventories: { select: { quantity: true } },
      _count: { select: { stockIns: true } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => ({
    ...p,
    totalStock: p.inventories.reduce((s, i) => s + i.quantity, 0),
  }));
}

export default async function ProdukPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk"
        description={`${products.length} produk aktif`}
        action={
          <Link href="/produk/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </Link>
        }
      />

      <Card>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-10 w-10 text-stone mb-3" />
            <p className="text-sm font-medium text-ink">Belum ada produk</p>
            <p className="text-xs text-mute mt-1">
              Mulai dengan menambahkan produk pertama
            </p>
            <Link href="/produk/baru">
              <button className="btn-primary btn-sm mt-5">Tambah Produk</button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Stok Total</TableHead>
                <TableHead className="text-right">Min Stok</TableHead>
                <TableHead>Status Stok</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLow =
                  product.totalStock <= product.minStock &&
                  product.minStock > 0;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {product.sku}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/produk/${product.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="text-xs text-mute mt-0.5 line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-mute">{product.unit}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(product.totalStock)}
                    </TableCell>
                    <TableCell className="text-right text-mute">
                      {formatNumber(product.minStock)}
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="danger">Hampir Habis</Badge>
                      ) : (
                        <Badge variant="success">Aman</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ProductActions
                        productId={product.id}
                        productName={product.name}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
