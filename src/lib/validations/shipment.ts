import { z } from "zod";

export const shipmentSchema = z.object({
  orderId: z.string().min(1, "Pesanan wajib dipilih"),
  vehicleNo: z.string().optional(),
  driverName: z.string().optional(),
  estimatedArrival: z.string().optional(),
  notes: z.string().optional(),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;
