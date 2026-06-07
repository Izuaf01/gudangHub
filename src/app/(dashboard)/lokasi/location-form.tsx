"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  locationSchema,
  type LocationFormValues,
} from "@/lib/validations/location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface LocationFormProps {
  defaultValues?: Partial<LocationFormValues>;
  locationId?: string;
}

const ZONES = ["A", "B", "C", "D", "E", "F"];

export function LocationForm({ defaultValues, locationId }: LocationFormProps) {
  const router = useRouter();
  const isEdit = !!locationId;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { capacity: 100, ...defaultValues },
  });

  const watchZone = watch("zone");
  const row = watch("row");
  const shelf = watch("shelf");
  const previewCode =
    watchZone && row && shelf
      ? `${watchZone}-${row}-${shelf}`.toUpperCase()
      : "—";

  async function onSubmit(data: LocationFormValues) {
    try {
      // Auto-generate code from zone/row/shelf
      const codeData = {
        ...data,
        code: `${data.zone}-${data.row}-${data.shelf}`.toUpperCase(),
      };

      const url = isEdit ? `/api/locations/${locationId}` : "/api/locations";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }

      toast.success(
        isEdit ? "Lokasi berhasil diperbarui" : "Lokasi berhasil ditambahkan",
      );
      router.push("/lokasi");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5 pt-6">
          {/* Code preview */}
          <div className="p-4 bg-soft-cloud border border-hairline-soft">
            <p className="text-xs text-mute mb-1">Kode Lokasi (otomatis)</p>
            <p className="text-xl font-mono font-medium text-ink">
              {previewCode}
            </p>
            <p className="text-xs text-mute mt-1">Format: ZONA-BARIS-RAK</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Zona"
              required
              error={errors.zone?.message}
              hint="Misal: A, B, C"
            >
              <select {...register("zone")} className="input">
                <option value="">Pilih zona</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Baris"
              required
              error={errors.row?.message}
              hint="Misal: 01, 02, 03"
            >
              <Input
                {...register("row")}
                placeholder="01"
                error={errors.row?.message}
              />
            </FormField>

            <FormField
              label="Rak"
              required
              error={errors.shelf?.message}
              hint="Misal: 01, 02"
            >
              <Input
                {...register("shelf")}
                placeholder="01"
                error={errors.shelf?.message}
              />
            </FormField>
          </div>

          <FormField
            label="Kapasitas (unit)"
            required
            error={errors.capacity?.message}
            hint="Jumlah maksimum unit yang dapat disimpan"
          >
            <Input
              {...register("capacity", { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="100"
              error={errors.capacity?.message}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/lokasi")}
          >
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Perbarui Lokasi"
                : "Tambah Lokasi"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
