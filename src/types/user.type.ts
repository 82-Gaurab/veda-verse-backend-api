import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  profilePicture: z.string().optional(),
  wishlist: z.array(z.string()).optional(),
  cart: z
    .array(
      z.object({
        bookId: z.string(),
        quantity: z.number().min(1),
      }),
    )
    .optional(),
});

export type UserType = z.infer<typeof UserSchema>;
