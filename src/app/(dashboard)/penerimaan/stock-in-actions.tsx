"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { StockInStatus } from "@prisma/client";

const NEXT_STATUS: Partial<
  Record<StockInStatus, { label: string; value: StockInStatus }>
> = {
  PENDING: { label: "Mulai Terima", value: "RECEIVING" },
  RECEIVING: { label: "Kirim ke QC", value: "QC" },
  QC: { label: "Lihat QC", value: "QC" },
};

interface StockInActionsProps {
  stockInId: string;
  currentStatus: StockInStatus;
}

export function StockInActions({
  stockInId,
  currentStatus,
}: StockInActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const next = NEXT_STATUS[currentStatus];
  const isQcAction = currentStatus === "QC";

  async function handleStatusChange(status: StockInStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-in/${stockInId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal mengubah status");
      }
      toast.success("Status berhasil diperbarui");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/penerimaan/${stockInId}`)}
        >
          <Eye className="h-4 w-4" />
          Detail
        </DropdownMenuItem>
        {next && (
          <>
            <DropdownMenuSeparator />
            {isQcAction ? (
              <DropdownMenuItem onClick={() => router.push(`/qc/${stockInId}`)}>
                <ChevronRight className="h-4 w-4" />
                {next.label}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleStatusChange(next.value)}>
                <ChevronRight className="h-4 w-4" />
                {next.label}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
