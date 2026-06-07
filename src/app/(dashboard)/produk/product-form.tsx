"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  productId?: string;
}

const PRODUCT_CATEGORIES = [
  "Elektronik",
  "Pakaian",
  "Makanan & Minuman",
  "Peralatan Rumah Tangga",
  "Furniture",
  "Otomotif",
  "Kesehatan & Kecantikan",
  "Olahraga",
  "Buku & Alat Tulis",
  "Lainnya",
];

const PRODUCT_UNITS = [
  "pcs",
  "kg",
  "liter",
  "meter",
  "box",
  "karton",
  "lusin",
  "set",
  "unit",
];

export function ProductForm({ defaultValues, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      minStock: 0,
      ...defaultValues,
    },
  });

  async function onSubmit(data: ProductFormValues) {
    try {
      const url = isEdit ? `/api/products/${productId}` : "/api/products";
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
        isEdit ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan",
      );
      router.push("/produk");
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
            <FormField label="SKU" required error={errors.sku?.message}>
              <Input
                {...register("sku")}
                placeholder="PRD-001"
                error={errors.sku?.message}
              />
            </FormField>
            <FormField
              label="Kategori"
              required
              error={errors.category?.message}
            >
              <select {...register("category")} className="input">
                <option value="">Pilih kategori</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Nama Produk" required error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Nama lengkap produk"
              error={errors.name?.message}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Satuan" required error={errors.unit?.message}>
              <select {...register("unit")} className="input">
                <option value="">Pilih satuan</option>
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="Minimum Stok"
              required
              error={errors.minStock?.message}
              hint="Notifikasi akan dikirim jika stok di bawah nilai ini"
            >
              <Input
                {...register("minStock", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                error={errors.minStock?.message}
              />
            </FormField>
          </div>

          <FormField label="Deskripsi" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="Deskripsi produk (opsional)"
              rows={3}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/produk")}
          >
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Perbarui Produk"
                : "Tambah Produk"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
