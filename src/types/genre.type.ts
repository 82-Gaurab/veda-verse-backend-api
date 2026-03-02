import z from "zod";

export const GenreSchema = z.object({
  name: z.string().min(1, { message: "Genre name is required" }),
});

export type GenreType = z.infer<typeof GenreSchema>;
