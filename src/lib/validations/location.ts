import { z } from "zod";

export const locationSchema = z.object({
  code: z.string().max(20).optional(),
  zone: z.string().min(1, "Zona wajib diisi").max(10),
  row: z.string().min(1, "Baris wajib diisi").max(10),
  shelf: z.string().min(1, "Rak wajib diisi").max(10),
  capacity: z.number().int().min(1, "Kapasitas minimal 1"),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
