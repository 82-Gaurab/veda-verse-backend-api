import mongoose from "mongoose";
import { CreateBookDTO } from "../dtos/book.dto";
import { HttpError } from "../error/http-error";
import { BookModel, IBook } from "../models/book.model";
import { GenreModel } from "../models/genre.model";
import { BookRepository } from "../repository/book.repository";

let bookRepository = new BookRepository();

export class BookService {
  async createBook(bookData: CreateBookDTO) {
    type NewType = mongoose.Types.ObjectId;

    let genreIds: NewType[] = [];

    if (bookData.genre && bookData.genre.length > 0) {
      // Find genres by name
      const existingGenres = await GenreModel.find({
        name: { $in: bookData.genre },
      });

      // Validate all genres exist
      if (existingGenres.length !== bookData.genre.length) {
        const existingNames = existingGenres.map((g) => g.name);

        const missingGenres = bookData.genre.filter(
          (name) => !existingNames.includes(name),
        );

        throw new HttpError(
          400,
          `Genre(s) not found: ${missingGenres.join(", ")}`,
        );
      }
      // Extract ObjectIds
      genreIds = existingGenres.map((g) => g._id as mongoose.Types.ObjectId);
    }
    // Create book with validated genreIds
    const newBook = await BookModel.create({
      ...bookData,
      genre: genreIds,
    });

    return newBook;
  }

  async getAllBooks(search?: string) {
    return await bookRepository.getAllBooks(search);
  }

  async getBookById(id: string) {
    const book = await bookRepository.getBookById(id);
    if (!book) throw new HttpError(404, "No book of such Id");

    return book;
  }

  async getBooksByGenre(genreId: string): Promise<IBook[]> {
    return bookRepository.getBooksByGenre(genreId);
  }
}
