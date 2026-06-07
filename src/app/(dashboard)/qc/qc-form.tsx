"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { qcSchema, type QcFormValues } from "@/lib/validations/qc";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";

interface QcFormProps {
  stockInId: string;
  totalQty: number;
}

export function QcForm({ stockInId, totalQty }: QcFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QcFormValues>({
    resolver: zodResolver(qcSchema),
    defaultValues: {
      passedQty: totalQty,
      rejectedQty: 0,
    },
  });

  const passedQty = watch("passedQty") || 0;
  const rejectedQty = watch("rejectedQty") || 0;
  const total = passedQty + rejectedQty;
  const passRate = total > 0 ? Math.round((passedQty / total) * 100) : 0;

  async function onSubmit(data: QcFormValues) {
    try {
      const res = await fetch(`/api/qc/${stockInId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan hasil QC");
      }

      toast.success("Hasil QC berhasil disimpan");
      router.push("/qc");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent className="space-y-5 pt-6">
          {/* Live summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-soft-cloud">
            <div>
              <p className="text-xs text-mute mb-1">Total Diperiksa</p>
              <p className="text-xl font-medium text-ink">{total}</p>
            </div>
            <div>
              <p className="text-xs text-mute mb-1">Lolos QC</p>
              <p className="text-xl font-medium text-success">{passedQty}</p>
            </div>
            <div>
              <p className="text-xs text-mute mb-1">Tingkat Lolos</p>
              <p className="text-xl font-medium text-ink">{passRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Kuantitas Lolos"
              required
              error={errors.passedQty?.message}
              hint={`Dari total ${totalQty} barang`}
            >
              <Input
                {...register("passedQty", { valueAsNumber: true })}
                type="number"
                min={0}
                max={totalQty}
                error={errors.passedQty?.message}
              />
            </FormField>

            <FormField
              label="Kuantitas Ditolak"
              required
              error={errors.rejectedQty?.message}
            >
              <Input
                {...register("rejectedQty", { valueAsNumber: true })}
                type="number"
                min={0}
                max={totalQty}
                error={errors.rejectedQty?.message}
              />
            </FormField>
          </div>

          <FormField
            label="Catatan Pemeriksaan"
            error={errors.notes?.message}
            hint="Opsional — catat alasan penolakan jika ada"
          >
            <Textarea
              {...register("notes")}
              placeholder="Contoh: 5 unit cacat kemasan, 2 unit rusak..."
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
            {isSubmitting ? "Menyimpan..." : "Simpan Hasil QC"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
