import z from "zod";
import { BookSchema } from "../types/book.type";

export const CreateBookDTO = BookSchema.pick({ id: true, title: true });
export type CreateBookDTO = z.infer<typeof CreateBookDTO>;
