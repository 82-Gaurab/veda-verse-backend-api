import z from "zod";
import { GenreSchema } from "../types/genre.type";

export const CreateGenreDTO = GenreSchema.pick({
  name: true,
});

export type CreateGenreDTO = z.infer<typeof CreateGenreDTO>;

export const UpdateGenreDTO = GenreSchema.partial();
export type UpdateGenreDTO = z.infer<typeof UpdateGenreDTO>;
