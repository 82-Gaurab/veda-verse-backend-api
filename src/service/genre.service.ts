import { CreateGenreDTO, UpdateGenreDTO } from "../dtos/genre.dto";
import { UpdateUserDTO } from "../dtos/user.dto";
import { HttpError } from "../error/http-error";
import { IGenre } from "../models/genre.model";
import { GenreRepository } from "../repository/genre.repository";

let genreRepository = new GenreRepository();
export class GenreService {
  async createGenre(data: CreateGenreDTO): Promise<IGenre> {
    return await genreRepository.create(data);
  }

  async getAllGenres(): Promise<IGenre[]> {
    return await genreRepository.getAllGenres();
  }

  async getAllGenresPaginated(
    page?: string,
    size?: string,
    search?: string,
  ): Promise<{
    genres: IGenre[];
    pagination: {
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { genres, total } = await genreRepository.getAllGenresPaginated(
      pageNumber,
      pageSize,
      search,
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { genres, pagination };
  }

  async deleteGenre(id: string) {
    const genre = await genreRepository.getGenreById(id);
    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }
    const deleted = await genreRepository.deleteGenre(id);
    return deleted;
  }

  async updateGenre(id: string, updateData: UpdateGenreDTO) {
    const genre = await genreRepository.getGenreById(id);
    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }
    const updatedGenre = await genreRepository.updateGenre(id, updateData);
    return updatedGenre;
  }

  async getGenreById(id: string) {
    const genre = await genreRepository.getGenreById(id);
    if (!genre) {
      throw new HttpError(404, "Genre not found");
    }
    return genre;
  }
}
