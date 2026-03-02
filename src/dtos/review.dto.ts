import z from "zod";
import { ReviewSchema } from "../types/review.type";

export const CreateReviewDTO = ReviewSchema.pick({
  bookId: true,
  comment: true,
  title: true,
  rating: true,
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;

export const UpdateReviewDTO = ReviewSchema.omit({
  userId: true,
  bookId: true,
}).partial();
export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTO>;
