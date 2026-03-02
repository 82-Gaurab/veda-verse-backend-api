// types/order.type.ts
import z from "zod";

export const OrderSchema = z.object({
  userId: z.string(),

  books: z.array(
    z.object({
      bookId: z.string(),
      quantity: z.number().int().min(1),
    }),
  ),

  totalPrice: z.number().min(0),

  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

export type OrderType = z.infer<typeof OrderSchema>;
