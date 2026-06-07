"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/lib/validations/supplier";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormValues>;
  supplierId?: string;
}

export function SupplierForm({ defaultValues, supplierId }: SupplierFormProps) {
  const router = useRouter();
  const isEdit = !!supplierId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues,
  });

  async function onSubmit(data: SupplierFormValues) {
    try {
      const url = isEdit ? `/api/suppliers/${supplierId}` : "/api/suppliers";
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
          ? "Supplier berhasil diperbarui"
          : "Supplier berhasil ditambahkan",
      );
      router.push("/supplier");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5 pt-6">
          <FormField
            label="Nama Supplier"
            required
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="Nama perusahaan supplier"
              error={errors.name?.message}
            />
          </FormField>

          <FormField label="Nama Kontak" error={errors.contact?.message}>
            <Input
              {...register("contact")}
              placeholder="Nama PIC atau kontak person"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email?.message}>
              <Input
                {...register("email")}
                type="email"
                placeholder="email@supplier.com"
                error={errors.email?.message}
              />
            </FormField>
            <FormField label="Telepon" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="08xx-xxxx-xxxx" />
            </FormField>
          </div>

          <FormField label="Alamat" error={errors.address?.message}>
            <Textarea
              {...register("address")}
              placeholder="Alamat lengkap supplier"
              rows={3}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/supplier")}
          >
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Perbarui Supplier"
                : "Tambah Supplier"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
