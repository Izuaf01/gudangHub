import { z } from "zod";

export const qcSchema = z
  .object({
    passedQty: z.number().int().min(0, "Kuantitas lolos tidak boleh negatif"),
    rejectedQty: z
      .number()
      .int()
      .min(0, "Kuantitas ditolak tidak boleh negatif"),
    notes: z.string().optional(),
  })
  .refine((data) => data.passedQty + data.rejectedQty > 0, {
    message: "Total kuantitas harus lebih dari 0",
    path: ["passedQty"],
  });

export type QcFormValues = z.infer<typeof qcSchema>;
