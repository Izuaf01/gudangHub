import { z } from "zod";

export const packingSchema = z.object({
  weight: z.number().min(0, "Berat tidak boleh negatif").optional(),
  boxCount: z.number().int().min(1, "Minimal 1 box").optional(),
  notes: z.string().optional(),
});

export type PackingFormValues = z.infer<typeof packingSchema>;
