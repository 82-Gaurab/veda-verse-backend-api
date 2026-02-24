import mongoose from "mongoose";
import { CreateBookDTO } from "../../dtos/book.dto";
import { HttpError } from "../../error/http-error";
import { BookRepository } from "../../repository/book.repository";
import { GenreRepository } from "../../repository/genre.repository";
import { IBook } from "../../models/book.model";

const bookRepository = new BookRepository();
let genreRepository = new GenreRepository();

export class AdminBookService {
  async createBook(bookData: CreateBookDTO) {
    const bookCheck = await bookRepository.getBookByTitle(bookData.title);
    if (bookCheck) {
      throw new HttpError(403, "Book already exists");
    }

    let genreIds: mongoose.Types.ObjectId[] = [];

    if (bookData.genre && bookData.genre.length > 0) {
      const genres = await genreRepository.getGenresByNames(bookData.genre);

      // Check if some genres were not found
      if (genres.length !== bookData.genre.length) {
        throw new HttpError(404, "One or more genres not found");
      }

      genreIds = genres.map((genre) => genre._id as mongoose.Types.ObjectId);
    }

    const formattedData = {
      ...bookData,
      genre: genreIds,
    };

    const newBook = await bookRepository.createBook(formattedData);
    return newBook;
  }

  async getAllBookPaginated(
    page?: string,
    size?: string,
    search?: string,
  ): Promise<{
    books: IBook[];
    pagination: {
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { books, total } = await bookRepository.getAllBooksPaginated(
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

    return { books, pagination };
  }
  async deleteBook(id: string) {
    const user = await bookRepository.getBookById(id);
    if (!user) {
      throw new HttpError(404, "Book not found");
    }
    const deleted = await bookRepository.deleteBook(id);
    return deleted;
  }
}
