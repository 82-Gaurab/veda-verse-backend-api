import z from "zod";
import { OrderSchema } from "../types/order.type";

export const CreateOrderDTO = OrderSchema.pick({
  userId: true,
  books: true,
});

export type CreateOrderDTO = z.infer<typeof CreateOrderDTO>;
export const UpdateOrderDTO = OrderSchema.pick({
  status: true,
});

export type UpdateOrderDTO = z.infer<typeof UpdateOrderDTO>;
