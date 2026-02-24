import z from "zod";

export const BookSchema = z.object({
  title: z.string().min(1, { message: "Book title is required" }),
  author: z.string().min(1, { message: "Book author is required" }),
  genre: z.array(z.string()).optional(),
  price: z.number().min(1, { message: "Book must have a price" }),
  stockAmount: z
    .number()
    .min(0, { message: "Stock Amount must at least be 0" }),
  publishedYear: z.string().optional(),
  coverImg: z.string().optional(),
});

export type BookType = z.infer<typeof BookSchema>;
