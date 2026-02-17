import { CreateBookDTO } from "../dtos/book.dto";
import { HttpError } from "../error/http-error";
import { BookRepository } from "../repository/book.repository";
import { BookType } from "../types/book.type";

let bookRepository = new BookRepository();

export class BookService {
  async createBook(bookData: CreateBookDTO) {
    return bookRepository.createBook(bookData);
  }

  async getAllBooks() {
    let receivedBooks = await bookRepository.getAllBooks();
    let transformedBooks = receivedBooks.map((bk) => {
      return {
        ...bk,
        title: bk.title.toUpperCase(),
      };
    });
    return transformedBooks;
  }

  getBookById(id: string) {
    const book = bookRepository.getBookById(id);
    if (book === undefined) {
      throw new HttpError(404, "No book of such Id");
    }
  }
}
