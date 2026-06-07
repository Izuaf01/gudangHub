"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { storeSchema, type StoreFormValues } from "@/lib/validations/store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface TokoFormProps {
  defaultValues?: Partial<StoreFormValues>;
  storeId?: string;
}

export function TokoForm({ defaultValues, storeId }: TokoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!storeId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues,
  });

  async function onSubmit(data: StoreFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/stores/${storeId}` : "/api/stores",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }
      toast.success(isEdit ? "Toko diperbarui" : "Toko ditambahkan");
      router.push("/toko");
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
          <FormField label="Nama Toko" required error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Nama toko"
              error={errors.name?.message}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Kota" required error={errors.city?.message}>
              <Input
                {...register("city")}
                placeholder="Jakarta"
                error={errors.city?.message}
              />
            </FormField>
            <FormField label="No. Telepon" error={errors.phone?.message}>
              <Input
                {...register("phone")}
                placeholder="08xxx"
                error={errors.phone?.message}
              />
            </FormField>
          </div>

          <FormField label="Alamat" required error={errors.address?.message}>
            <Input
              {...register("address")}
              placeholder="Jl. ..."
              error={errors.address?.message}
            />
          </FormField>

          <FormField
            label="Kontak Person"
            error={errors.contactPerson?.message}
          >
            <Input
              {...register("contactPerson")}
              placeholder="Nama kontak"
              error={errors.contactPerson?.message}
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
            {submitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Toko"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
