import z from "zod";

export const MessageSchema = z.object({
  username: z.string(),
  userEmail: z.string(),
  message: z.string(),
});

export type MessageType = z.infer<typeof MessageSchema>;
