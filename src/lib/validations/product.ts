import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi").max(50),
  name: z.string().min(1, "Nama produk wajib diisi").max(200),
  category: z.string().min(1, "Kategori wajib diisi"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  minStock: z.number().int().min(0, "Minimum stok tidak boleh negatif"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
