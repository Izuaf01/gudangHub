import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store } from "lucide-react";
import Link from "next/link";
import { TokoActions } from "./toko-actions";

async function getStores() {
  return prisma.store.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { orders: true, shipments: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function TokoPage() {
  const stores = await getStores();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Toko"
        description={`${stores.length} toko aktif`}
        action={
          <Link href="/toko/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Store className="h-4 w-4" />
              Tambah Toko
            </button>
          </Link>
        }
      />

      <Card>
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Store className="h-12 w-12 text-stone mb-4" />
            <p className="text-sm font-medium text-ink mb-1">Belum ada toko</p>
            <p className="text-xs text-mute">Tambahkan toko pertama Anda</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Toko</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-right">Total Pesanan</TableHead>
                <TableHead className="text-right">Total Pengiriman</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium text-ink">
                    {store.name}
                  </TableCell>
                  <TableCell className="text-sm text-mute">
                    {store.city}
                  </TableCell>
                  <TableCell className="text-sm text-mute max-w-xs truncate">
                    {store.address}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{store.contactPerson ?? "—"}</p>
                    {store.phone && (
                      <p className="text-xs text-mute">{store.phone}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {store._count.orders}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {store._count.shipments}
                  </TableCell>
                  <TableCell>
                    <TokoActions storeId={store.id} />
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
