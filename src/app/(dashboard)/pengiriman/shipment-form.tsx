"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  shipmentSchema,
  type ShipmentFormValues,
} from "@/lib/validations/shipment";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface ReadyOrder {
  id: string;
  orderNo: string;
  store: { name: string; city: string };
  itemCount: number;
}

interface ShipmentFormProps {
  readyOrders: ReadyOrder[];
}

export function ShipmentForm({ readyOrders }: ShipmentFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
  });

  async function onSubmit(data: ShipmentFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal membuat pengiriman");
      }
      toast.success("Pengiriman berhasil dibuat");
      router.push("/pengiriman");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <FormField
            label="Pesanan (Siap Kirim)"
            required
            error={errors.orderId?.message}
          >
            <select {...register("orderId")} className="input">
              <option value="">Pilih pesanan</option>
              {readyOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNo} — {o.store.name}, {o.store.city} ({o.itemCount}{" "}
                  item)
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="No. Kendaraan" error={errors.vehicleNo?.message}>
              <Input
                {...register("vehicleNo")}
                placeholder="B 1234 XYZ"
                error={errors.vehicleNo?.message}
              />
            </FormField>
            <FormField label="Nama Driver" error={errors.driverName?.message}>
              <Input
                {...register("driverName")}
                placeholder="Nama driver"
                error={errors.driverName?.message}
              />
            </FormField>
          </div>

          <FormField
            label="Estimasi Tiba"
            error={errors.estimatedArrival?.message}
          >
            <Input
              {...register("estimatedArrival")}
              type="datetime-local"
              error={errors.estimatedArrival?.message}
            />
          </FormField>

          <FormField label="Catatan" error={errors.notes?.message}>
            <Textarea
              {...register("notes")}
              placeholder="Instruksi pengiriman khusus..."
              rows={2}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-hairline-soft pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? "Menyimpan..." : "Buat Pengiriman"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
