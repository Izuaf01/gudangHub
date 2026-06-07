"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface PickingItem {
  id: string;
  requestedQty: number;
  pickedQty: number;
  product: {
    name: string;
    sku: string;
    unit: string;
    inventories: {
      id: string;
      quantity: number;
      location: { code: string; zone: string };
    }[];
  };
}

interface PickingFormProps {
  orderId: string;
  taskStatus: string;
  items: PickingItem[];
}

export function PickingForm({ orderId, taskStatus, items }: PickingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pickedQtys, setPickedQtys] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.requestedQty])),
  );

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch(`/api/picking/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Picking dimulai");
      router.refresh();
    } catch {
      toast.error("Gagal memulai picking");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const pickedItems = items.map((item) => ({
        orderItemId: item.id,
        pickedQty: pickedQtys[item.id] ?? 0,
      }));

      const res = await fetch(`/api/picking/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", pickedItems }),
      });
      if (!res.ok) throw new Error();
      toast.success("Picking selesai — pesanan masuk ke Packing");
      router.push("/picking");
      router.refresh();
    } catch {
      toast.error("Gagal menyelesaikan picking");
    } finally {
      setLoading(false);
    }
  }

  const allPicked = items.every(
    (item) => (pickedQtys[item.id] ?? 0) >= item.requestedQty,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {items.map((item) => {
              const qty = pickedQtys[item.id] ?? 0;
              const done = qty >= item.requestedQty;
              return (
                <div
                  key={item.id}
                  className={`p-4 border ${done ? "border-success/30 bg-success/5" : "border-hairline-soft"}`}
                >
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-stone mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink text-sm">
                            {item.product.name}
                          </p>
                          <p className="font-mono text-xs text-mute">
                            {item.product.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-mute">Diminta</p>
                          <p className="font-medium text-ink">
                            {formatNumber(item.requestedQty)}{" "}
                            {item.product.unit}
                          </p>
                        </div>
                      </div>

                      {/* Lokasi stok */}
                      {item.product.inventories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.product.inventories.map((inv) => (
                            <span
                              key={inv.id}
                              className="font-mono text-xs bg-soft-cloud px-2 py-0.5"
                            >
                              {inv.location.code} — {formatNumber(inv.quantity)}{" "}
                              {item.product.unit}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Qty input */}
                      {taskStatus === "IN_PROGRESS" && (
                        <div className="flex items-center gap-3 mt-3">
                          <label className="text-xs text-mute">
                            Qty Dipick:
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={item.requestedQty}
                            value={pickedQtys[item.id] ?? 0}
                            onChange={(e) =>
                              setPickedQtys((prev) => ({
                                ...prev,
                                [item.id]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="input w-24 h-9 text-sm"
                          />
                          {!done && <Badge variant="warning">Kurang</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-hairline-soft pt-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Kembali
          </Button>
          {taskStatus === "PENDING" && (
            <Button variant="primary" loading={loading} onClick={handleStart}>
              Mulai Picking
            </Button>
          )}
          {taskStatus === "IN_PROGRESS" && (
            <Button
              variant="primary"
              loading={loading}
              onClick={handleComplete}
            >
              {allPicked ? "Selesaikan Picking" : "Selesai (Partial)"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
