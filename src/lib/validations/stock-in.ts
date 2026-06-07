import { z } from "zod";

export const stockInSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  quantity: z.number().int().min(1, "Kuantitas minimal 1"),
  unitCost: z.number().min(0, "Harga satuan tidak boleh negatif"),
  invoiceNo: z.string().optional(),
  notes: z.string().optional(),
});

export type StockInFormValues = z.infer<typeof stockInSchema>;
