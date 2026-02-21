import z from "zod";

export const ReviewSchema = z.object({
  userId: z.string(),
  bookId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  comment: z.string(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
