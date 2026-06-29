"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "@/lib/validations/user";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

type Mode = "create" | "edit";

interface UserFormCreateProps {
  mode: "create";
}
interface UserFormEditProps {
  mode: "edit";
  userId: string;
  defaultValues: Partial<UpdateUserFormValues>;
}
type UserFormProps = UserFormCreateProps | UserFormEditProps;

export function UserForm(props: UserFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = props.mode === "edit";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit ? props.defaultValues : undefined,
  });

  async function onSubmit(data: CreateUserFormValues | UpdateUserFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/users/${(props as UserFormEditProps).userId}` : "/api/users";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }
      toast.success(isEdit ? "Pengguna diperbarui" : "Pengguna ditambahkan");
      router.push("/pengaturan/pengguna");
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
          <FormField label="Nama Lengkap" required error={(errors as Record<string, {message?: string}>).name?.message}>
            <Input
              {...register("name")}
              placeholder="Ahmad Fauzi"
              error={(errors as Record<string, {message?: string}>).name?.message}
            />
          </FormField>

          <FormField label="Email" required error={(errors as Record<string, {message?: string}>).email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              error={(errors as Record<string, {message?: string}>).email?.message}
            />
          </FormField>

          <FormField label="Role" required error={(errors as Record<string, {message?: string}>).role?.message}>
            <select {...register("role")} className="input">
              <option value="">Pilih role</option>
              <option value="ADMIN">Admin — akses penuh</option>
              <option value="MANAGER">Manager — kelola semua operasional</option>
              <option value="STAFF">Staff — operasional harian</option>
              <option value="VIEWER">Viewer — hanya lihat</option>
            </select>
          </FormField>

          <FormField
            label={isEdit ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
            required={!isEdit}
            error={(errors as Record<string, {message?: string}>).password?.message}
          >
            <Input
              {...register("password")}
              type="password"
              placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
              error={(errors as Record<string, {message?: string}>).password?.message}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-hairline-soft pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
