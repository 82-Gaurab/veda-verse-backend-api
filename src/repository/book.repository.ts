import { BookType } from "../types/book.type";

export const book: BookType[] = [
  { id: "B-1", title: "1984" },
  { id: "B-2", title: "To kill a Mockingbird", date: "2015-12-10" },
];

export interface IBookRepository {
  getAllBooks(): BookType[];
  getBookById(id: string): BookType | undefined;
  createBook(book: BookType): BookType;
}

export class BookRepository implements IBookRepository {
  getAllBooks(): BookType[] {
    return book;
  }
  getBookById(id: string): BookType | undefined {
    return book.find((bk) => bk.id === id);
  }
  createBook(newBook: BookType): BookType {
    book.push(newBook);
    return newBook;
  }
}
