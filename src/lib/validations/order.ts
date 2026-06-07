import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  requestedQty: z.number().int().min(1, "Kuantitas minimal 1"),
});

export const orderSchema = z.object({
  storeId: z.string().min(1, "Toko wajib dipilih"),
  priority: z.enum(["NORMAL", "URGENT"]),
  notes: z.string().optional(),
  scheduledShipAt: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Minimal 1 item pesanan"),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
