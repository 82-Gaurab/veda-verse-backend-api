import { IBook, BookModel } from "../models/book.model";

export interface IBookRepository {
  getAllBooks(): Promise<IBook[]>;
  getBookById(id: string): Promise<IBook | undefined>;
  createBook(book: Partial<IBook>): Promise<IBook>;
}

export class BookRepository implements IBookRepository {
  async getAllBooks(): Promise<IBook[]> {
    const books = await BookModel.find().lean();
    return books;
  }
  getBookById(id: string): Promise<IBook | undefined> {
    throw new Error("Method not implemented.");
  }
  async createBook(bookData: Partial<IBook>): Promise<IBook> {
    const book = new BookModel(bookData);
    return await book.save();
  }
}
