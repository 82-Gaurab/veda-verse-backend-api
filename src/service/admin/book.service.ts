import mongoose from "mongoose";
import { CreateBookDTO, UpdateBookDTO } from "../../dtos/book.dto";
import { HttpError } from "../../error/http-error";
import { BookRepository } from "../../repository/book.repository";
import { GenreRepository } from "../../repository/genre.repository";
import { IBook } from "../../models/book.model";
import { GenreModel } from "../../models/genre.model";

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

  async getBookById(id: string) {
    const book = await bookRepository.getBookById(id);
    if (!book) throw new HttpError(404, "No book of such Id");

    const bookObj = book.toObject();
    bookObj.genre = bookObj.genre.map((g: any) => g.name);

    return bookObj;
  }

  async updateBook(id: string, updateData: UpdateBookDTO) {
    const book = await bookRepository.getBookById(id);
    if (!book) throw new HttpError(404, "Book not found");

    let genreIds: mongoose.Types.ObjectId[] | undefined;

    if (updateData.genre && updateData.genre.length > 0) {
      const existingGenres = await GenreModel.find({
        name: { $in: updateData.genre },
      });

      if (existingGenres.length !== updateData.genre.length) {
        const existingNames = existingGenres.map((g) => g.name);
        const missing = updateData.genre.filter(
          (name) => !existingNames.includes(name),
        );
        throw new HttpError(400, `Genre(s) not found: ${missing.join(", ")}`);
      }

      genreIds = existingGenres.map((g) => g._id);
    }

    // Destructure updateData without genre
    const { genre, ...rest } = updateData;

    const updatedData: Partial<IBook> = {
      ...rest, // safe fields
      ...(genreIds ? { genre: genreIds } : {}), // only ObjectId[] for genre
    };

    const updatedBook = await bookRepository.updateBook(id, updatedData);

    return updatedBook;
  }
}
