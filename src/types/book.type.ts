import z from "zod";

export const BookSchema = z.object({
  id: z.string().min(1, { message: "Book Id is required" }),
  title: z.string().min(1, { message: "Book title is required" }),
  date: z.string().optional(),
});

export type BookType = z.infer<typeof BookSchema>;
