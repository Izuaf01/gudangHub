"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import type { ShipmentStatus } from "@prisma/client";

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  READY: "Siap",
  DEPARTED: "Berangkat",
  IN_TRANSIT: "Dalam Perjalanan",
  DELIVERED: "Terkirim",
};

const NEXT_ACTION_LABEL: Partial<Record<ShipmentStatus, string>> = {
  READY: "Tandai Berangkat",
  DEPARTED: "Tandai Dalam Perjalanan",
  IN_TRANSIT: "Tandai Terkirim",
};

const STATUS_VARIANT: Record<
  ShipmentStatus,
  "default" | "info" | "warning" | "success"
> = {
  READY: "default",
  DEPARTED: "info",
  IN_TRANSIT: "warning",
  DELIVERED: "success",
};

interface ShipmentStatusButtonProps {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}

export function ShipmentStatusButton({
  shipmentId,
  currentStatus,
}: ShipmentStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextLabel = NEXT_ACTION_LABEL[currentStatus];
  if (!nextLabel) {
    return (
      <Badge variant={STATUS_VARIANT[currentStatus]}>
        {STATUS_LABEL[currentStatus]}
      </Badge>
    );
  }

  async function handleAdvance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "advance" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status pengiriman diperbarui");
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      onClick={handleAdvance}
    >
      <ArrowRight className="h-4 w-4" />
      {nextLabel}
    </Button>
  );
}
