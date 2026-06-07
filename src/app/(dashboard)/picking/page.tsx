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
import { HandMetal } from "lucide-react";
import Link from "next/link";

async function getPickingTasks() {
  return prisma.pickingTask.findMany({
    where: { status: { not: "COMPLETED" } },
    include: {
      order: {
        include: {
          store: { select: { name: true, city: true } },
          items: { select: { id: true } },
        },
      },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getCompletedTasks() {
  return prisma.pickingTask.findMany({
    where: { status: "COMPLETED" },
    include: {
      order: { include: { store: { select: { name: true } } } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 10,
  });
}

export default async function PickingPage() {
  const [pending, completed] = await Promise.all([
    getPickingTasks(),
    getCompletedTasks(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Picking"
        description={`${pending.length} task menunggu`}
      />

      <div>
        <h2 className="text-sm font-medium text-ink mb-3">Menunggu Picking</h2>
        <Card>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <HandMetal className="h-10 w-10 text-success mb-3" />
              <p className="text-sm font-medium text-ink">
                Semua picking sudah selesai
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead className="text-right">Jumlah Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign To</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((task) => (
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
                    <TableCell className="text-right">
                      {task.order.items.length} item
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === "IN_PROGRESS" ? "warning" : "default"
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
                      <Link href={`/picking/${task.order.id}`}>
                        <button className="btn-primary btn-sm">Proses</button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
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
                      {task.completedAt
                        ? formatDateTime(task.completedAt)
                        : "—"}
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
