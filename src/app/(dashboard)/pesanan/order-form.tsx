"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { orderSchema, type OrderFormValues } from "@/lib/validations/order";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalStock: number;
}

interface Store {
  id: string;
  name: string;
  city: string;
}

interface OrderFormProps {
  products: Product[];
  stores: Store[];
}

export function OrderForm({ products, stores }: OrderFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      priority: "NORMAL",
      items: [{ productId: "", requestedQty: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  async function onSubmit(data: OrderFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal membuat pesanan");
      }

      toast.success("Pesanan berhasil dibuat");
      router.push("/pesanan");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Toko" required error={errors.storeId?.message}>
                <select {...register("storeId")} className="input">
                  <option value="">Pilih toko</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Prioritas"
                required
                error={errors.priority?.message}
              >
                <select {...register("priority")} className="input">
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </FormField>
            </div>

            <FormField
              label="Jadwal Pengiriman"
              error={errors.scheduledShipAt?.message}
            >
              <Input
                {...register("scheduledShipAt")}
                type="datetime-local"
                error={errors.scheduledShipAt?.message}
              />
            </FormField>

            <FormField label="Catatan" error={errors.notes?.message}>
              <Textarea
                {...register("notes")}
                placeholder="Catatan pesanan..."
                rows={2}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ink">Item Pesanan</h3>
              <button
                type="button"
                className="btn-secondary btn-sm flex items-center gap-1"
                onClick={() => append({ productId: "", requestedQty: 1 })}
              >
                <Plus className="h-3 w-3" />
                Tambah Item
              </button>
            </div>

            {errors.items?.root && (
              <p className="text-xs text-sale mb-3">
                {errors.items.root.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 bg-soft-cloud"
                >
                  <div className="flex-1">
                    <FormField
                      label={`Produk ${index + 1}`}
                      required
                      error={errors.items?.[index]?.productId?.message}
                    >
                      <select
                        {...register(`items.${index}.productId`)}
                        className="input"
                      >
                        <option value="">Pilih produk</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.name} (Stok: {p.totalStock} {p.unit})
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div className="w-32">
                    <FormField
                      label="Qty"
                      required
                      error={errors.items?.[index]?.requestedQty?.message}
                    >
                      <Input
                        {...register(`items.${index}.requestedQty`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min={1}
                        error={errors.items?.[index]?.requestedQty?.message}
                      />
                    </FormField>
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon mt-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-sale" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {submitting ? "Menyimpan..." : "Buat Pesanan"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
