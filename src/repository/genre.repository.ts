import { QueryFilter } from "mongoose";
import { CreateGenreDTO } from "../dtos/genre.dto";
import { GenreModel, IGenre } from "../models/genre.model";

export class GenreRepository {
  // info: create genre
  async create(data: CreateGenreDTO): Promise<IGenre> {
    const genre = new GenreModel(data);
    return await genre.save();
  }

  // info: get all for user
  async getAllGenres(): Promise<IGenre[]> {
    const genres = await GenreModel.find().lean();
    return genres;
  }

  // info: get genre by id
  async getGenreById(id: string): Promise<IGenre | null> {
    const genre = await GenreModel.findById(id);
    return genre;
  }

  // info: get all for admin
  async getAllGenresPaginated(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ genres: IGenre[]; total: number }> {
    const filter: QueryFilter<IGenre> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const [genres, total] = await Promise.all([
      GenreModel.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip((page - 1) * size)
        .limit(size),
      GenreModel.countDocuments(filter),
    ]);

    return { genres, total };
  }

  // info: delete genre
  async deleteGenre(id: string): Promise<boolean> {
    const result = await GenreModel.findByIdAndDelete(id);
    return result ? true : false;
  }

  // info: update genre
  async updateGenre(
    id: string,
    updatedData: Partial<IGenre>,
  ): Promise<IGenre | null> {
    const updatedGenre = await GenreModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    return updatedGenre;
  }
}
