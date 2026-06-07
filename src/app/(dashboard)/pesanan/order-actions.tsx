"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Trash2,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal mengkonfirmasi");
      }
      toast.success("Pesanan dikonfirmasi");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Pesanan dihapus");
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast.error("Gagal menghapus pesanan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="btn-icon">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/pesanan/${orderId}`)}>
            <Eye className="h-4 w-4" />
            Detail
          </DropdownMenuItem>
          {currentStatus === "DRAFT" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleConfirm} disabled={loading}>
                <CheckCircle className="h-4 w-4" />
                Konfirmasi
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-sale"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </>
          )}
          {currentStatus === "PICKING" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/picking/${orderId}`)}
              >
                <Package className="h-4 w-4" />
                Proses Picking
              </DropdownMenuItem>
            </>
          )}
          {currentStatus === "PACKING" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/packing/${orderId}`)}
              >
                <Package className="h-4 w-4" />
                Proses Packing
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pesanan?</DialogTitle>
            <DialogDescription>
              Pesanan ini akan dihapus permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
