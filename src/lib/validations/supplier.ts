import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi").max(200),
  contact: z.string().optional(),
  address: z.string().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
