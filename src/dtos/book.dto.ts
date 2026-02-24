import z from "zod";
import { BookSchema } from "../types/book.type";

export const CreateBookDTO = BookSchema.pick({
  title: true,
  author: true,
  description: true,
  price: true,
  genre: true,
  stockAmount: true,
  publishedYear: true,
  coverImg: true,
});
export type CreateBookDTO = z.infer<typeof CreateBookDTO>;

export const UpdateBookDTO = BookSchema.partial();
export type UpdateBookDTO = z.infer<typeof UpdateBookDTO>;
