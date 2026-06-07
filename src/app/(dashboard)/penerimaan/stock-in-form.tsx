"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  stockInSchema,
  type StockInFormValues,
} from "@/lib/validations/stock-in";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface StockInFormProps {
  products: Product[];
  suppliers: Supplier[];
  defaultValues?: Partial<StockInFormValues>;
  stockInId?: string;
}

export function StockInForm({
  products,
  suppliers,
  defaultValues,
  stockInId,
}: StockInFormProps) {
  const router = useRouter();
  const isEdit = !!stockInId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      quantity: 1,
      unitCost: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(data: StockInFormValues) {
    try {
      const url = isEdit ? `/api/stock-in/${stockInId}` : "/api/stock-in";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }

      toast.success(
        isEdit
          ? "Penerimaan berhasil diperbarui"
          : "Penerimaan berhasil ditambahkan",
      );
      router.push("/penerimaan");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Produk"
              required
              error={errors.productId?.message}
            >
              <select {...register("productId")} className="input">
                <option value="">Pilih produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Supplier"
              required
              error={errors.supplierId?.message}
            >
              <select {...register("supplierId")} className="input">
                <option value="">Pilih supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Kuantitas"
              required
              error={errors.quantity?.message}
            >
              <Input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="0"
                error={errors.quantity?.message}
              />
            </FormField>

            <FormField
              label="Harga Satuan (Rp)"
              required
              error={errors.unitCost?.message}
            >
              <Input
                {...register("unitCost", { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="0"
                error={errors.unitCost?.message}
              />
            </FormField>
          </div>

          <FormField
            label="No. Invoice"
            error={errors.invoiceNo?.message}
            hint="Opsional — nomor invoice dari supplier"
          >
            <Input
              {...register("invoiceNo")}
              placeholder="INV-2024-001"
              error={errors.invoiceNo?.message}
            />
          </FormField>

          <FormField label="Catatan" error={errors.notes?.message}>
            <Textarea
              {...register("notes")}
              placeholder="Catatan tambahan..."
              rows={3}
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
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Penerimaan"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
