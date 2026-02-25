import z from "zod";
import { MessageSchema } from "../types/message.type";

export const CreateMessageDTO = MessageSchema.pick({
  username: true,
  userEmail: true,
  message: true,
});
export type CreateMessageDTO = z.infer<typeof CreateMessageDTO>;

export const UpdateMessageDTO = MessageSchema.pick({
  isTestimonial: true,
});

export type UpdateMessageDTO = z.infer<typeof UpdateMessageDTO>;
