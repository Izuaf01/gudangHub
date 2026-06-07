"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  packingSchema,
  type PackingFormValues,
} from "@/lib/validations/packing";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

interface PackingItem {
  id: string;
  requestedQty: number;
  pickedQty: number;
  product: { name: string; sku: string; unit: string };
}

interface PackingFormProps {
  orderId: string;
  items: PackingItem[];
}

export function PackingDetailForm({ orderId, items }: PackingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackingFormValues>({
    resolver: zodResolver(packingSchema),
    defaultValues: { boxCount: 1, weight: undefined, notes: "" },
  });

  async function onSubmit(data: PackingFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/packing/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan packing");
      }
      toast.success("Packing selesai — pesanan siap dikirim");
      router.push("/packing");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Item list (read-only) */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-ink mb-4">Item Pesanan</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Diminta</TableHead>
                <TableHead className="text-right">Dipick</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const partial = item.pickedQty < item.requestedQty;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-mono text-xs bg-soft-cloud px-2 py-0.5">
                        {item.product.sku}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatNumber(item.requestedQty)} {item.product.unit}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span
                        className={
                          partial ? "text-sale" : "text-success font-medium"
                        }
                      >
                        {formatNumber(item.pickedQty)} {item.product.unit}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Packing form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="pt-6 space-y-5">
            <h3 className="text-sm font-medium text-ink">Detail Packing</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Jumlah Box"
                required
                error={errors.boxCount?.message}
              >
                <Input
                  {...register("boxCount", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  error={errors.boxCount?.message}
                />
              </FormField>
              <FormField
                label="Berat Total (kg)"
                error={errors.weight?.message}
              >
                <Input
                  {...register("weight", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="0.0"
                  error={errors.weight?.message}
                />
              </FormField>
            </div>
            <FormField label="Catatan" error={errors.notes?.message}>
              <Textarea
                {...register("notes")}
                placeholder="Instruksi khusus, fragile, dll..."
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
              Kembali
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {submitting ? "Menyimpan..." : "Selesaikan Packing"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
