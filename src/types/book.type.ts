import z from "zod";

export const BookSchema = z.object({
  title: z.string().min(1, { message: "Book title is required" }),
  author: z.string().min(1, { message: "Book author is required" }),
  genre: z.string().optional(),
  price: z.number().min(1, { message: "Book must have a price" }),
  inStock: z.boolean().default(true),
  publishedYear: z.string().optional(),
});

export type BookType = z.infer<typeof BookSchema>;
