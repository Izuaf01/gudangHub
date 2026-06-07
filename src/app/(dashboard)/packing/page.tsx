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
import { formatDateTime } from "@/lib/utils";
import { Package } from "lucide-react";
import Link from "next/link";

async function getPackingTasks() {
  return prisma.packingTask.findMany({
    where: { status: { not: "COMPLETED" } },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: { select: { id: true, requestedQty: true, pickedQty: true } },
        },
      },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getCompletedTasks() {
  return prisma.packingTask.findMany({
    where: { status: "COMPLETED" },
    include: {
      order: { include: { store: { select: { name: true } } } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { packedAt: "desc" },
    take: 10,
  });
}

export default async function PackingPage() {
  const [pending, completed] = await Promise.all([
    getPackingTasks(),
    getCompletedTasks(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packing"
        description={`${pending.length} task menunggu`}
      />

      <div>
        <h2 className="text-sm font-medium text-ink mb-3">Menunggu Packing</h2>
        <Card>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Package className="h-10 w-10 text-success mb-3" />
              <p className="text-sm font-medium text-ink">
                Semua packing sudah selesai
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead className="text-right">Item Dipick</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign To</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((task) => {
                  const totalPicked = task.order.items.reduce(
                    (s, i) => s + i.pickedQty,
                    0,
                  );
                  const totalRequested = task.order.items.reduce(
                    (s, i) => s + i.requestedQty,
                    0,
                  );
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                          {task.order.orderNo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">
                          {task.order.store.name}
                        </p>
                        <p className="text-xs text-mute">
                          {task.order.store.city}
                        </p>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalPicked}/{totalRequested}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.status === "IN_PROGRESS"
                              ? "warning"
                              : "default"
                          }
                        >
                          {task.status === "IN_PROGRESS"
                            ? "Sedang Proses"
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-mute">
                        {task.assignedTo?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-mute">
                        {formatDateTime(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/packing/${task.order.id}`}>
                          <button className="btn-primary btn-sm">Proses</button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink mb-3">
            Selesai (10 Terakhir)
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Dikerjakan Oleh</TableHead>
                  <TableHead>Selesai Pada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completed.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {task.order.orderNo}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.order.store.name}
                    </TableCell>
                    <TableCell className="text-sm text-mute">
                      {task.assignedTo?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-mute">
                      {task.packedAt ? formatDateTime(task.packedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
