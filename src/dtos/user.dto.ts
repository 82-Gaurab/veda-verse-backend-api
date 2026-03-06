import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  password: true,
  profilePicture: true,
})
  .extend({ confirmPassword: z.string().min(6) })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const AddToCartDTO = z.object({
  product: z.string(),
  quantity: z.number().min(1),
});
export type AddToCartDTO = z.infer<typeof AddToCartDTO>;

// all fields optional for update
export const UpdateUserDTO = UserSchema.partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const UpdateCartQuantityDTO = z.object({
  product: z.string(),
  quantity: z.number().min(1),
});

export const RemoveCartItemDTO = z.object({
  product: z.string(),
});

export type UpdateCartQuantityDTO = z.infer<typeof UpdateCartQuantityDTO>;
export type RemoveCartItemDTO = z.infer<typeof RemoveCartItemDTO>;
