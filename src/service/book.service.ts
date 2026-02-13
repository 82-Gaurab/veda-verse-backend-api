import { CreateBookDTO } from "../dtos/book.dto";
import { HttpError } from "../error/http-error";
import { BookRepository } from "../repository/book.repository";
import { BookType } from "../types/book.type";

let bookRepository = new BookRepository();

export class BookService {
  createBook(data: CreateBookDTO) {
    const newBook: BookType = { ...data };

    const existingBook = bookRepository.getBookById(newBook.id);

    if (existingBook) {
      throw new HttpError(403, "Book ID already exists");
    }

    return bookRepository.createBook(newBook);
  }

  getAllBooks() {
    return bookRepository.getAllBooks().map((bk) => {
      return {
        ...bk,
        title: bk.title.toUpperCase(),
      };
    });
  }

  getBookById(id: string) {
    const book = bookRepository.getBookById(id);
    if (book === undefined) {
      throw new HttpError(404, "No book of such Id");
    }
  }
}
