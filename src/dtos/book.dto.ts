import z from "zod";
import { BookSchema } from "../types/book.type";

export const CreateBookDTO = BookSchema.pick({
  title: true,
  author: true,
  price: true,
  genre: true,
  stockAmount: true,
  publishedYear: true,
});
export type CreateBookDTO = z.infer<typeof CreateBookDTO>;
