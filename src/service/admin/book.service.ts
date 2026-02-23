import mongoose from "mongoose";
import { CreateBookDTO } from "../../dtos/book.dto";
import { HttpError } from "../../error/http-error";
import { BookRepository } from "../../repository/book.repository";

const bookRepository = new BookRepository();

export class AdminBookService {
  async createBook(bookData: CreateBookDTO) {
    const bookCheck = await bookRepository.getBookByTitle(bookData.title);
    if (bookCheck) {
      throw new HttpError(403, "Book already exists");
    }
    const formattedData = {
      ...bookData,
      genre: bookData.genre?.map((id) => new mongoose.Types.ObjectId(id)) || [],
    };
    const newBook = bookRepository.createBook(formattedData);
    return newBook;
  }

  async getAllBooks() {
    let receivedBooks = await bookRepository.getAllBooks();
    const transformedBooks = receivedBooks.map((bk) => ({
      ...bk,
      title: bk.title.toUpperCase(),
      genre: bk.genre.map((g: any) => g.name), // extract genre names
    }));

    return transformedBooks;
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
