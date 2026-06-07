import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Nama toko wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  city: z.string().min(1, "Kota wajib diisi"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
