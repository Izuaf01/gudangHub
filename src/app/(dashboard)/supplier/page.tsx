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
import { Users, Plus, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { SupplierActions } from "./supplier-actions";

async function getSuppliers() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    include: { _count: { select: { stockIns: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function SupplierPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier"
        description={`${suppliers.length} supplier aktif`}
        action={
          <Link href="/supplier/baru">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Supplier
            </button>
          </Link>
        }
      />

      <Card>
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="h-10 w-10 text-stone mb-3" />
            <p className="text-sm font-medium text-ink">Belum ada supplier</p>
            <p className="text-xs text-mute mt-1">
              Mulai dengan menambahkan supplier pertama
            </p>
            <Link href="/supplier/baru">
              <button className="btn-primary btn-sm mt-5">
                Tambah Supplier
              </button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Supplier</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="text-right">Total Penerimaan</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Link
                      href={`/supplier/${supplier.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {supplier.name}
                    </Link>
                    {supplier.address && (
                      <p className="text-xs text-mute mt-0.5 line-clamp-1">
                        {supplier.address}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-mute">
                    {supplier.contact ?? <span className="text-stone">—</span>}
                  </TableCell>
                  <TableCell>
                    {supplier.email ? (
                      <a
                        href={`mailto:${supplier.email}`}
                        className="flex items-center gap-1.5 text-sm text-info hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {supplier.email}
                      </a>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.phone ? (
                      <div className="flex items-center gap-1.5 text-sm text-mute">
                        <Phone className="h-3.5 w-3.5" />
                        {supplier.phone}
                      </div>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default">
                      {supplier._count.stockIns} penerimaan
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SupplierActions
                      supplierId={supplier.id}
                      supplierName={supplier.name}
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
