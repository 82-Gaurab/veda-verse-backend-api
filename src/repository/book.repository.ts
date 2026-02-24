import { QueryFilter, Types } from "mongoose";
import { IBook, BookModel } from "../models/book.model";

export interface IBookRepository {
  getAllBooks(): Promise<IBook[]>;
  getBookById(id: string): Promise<IBook | null>;
  createBook(book: Partial<IBook>): Promise<IBook>;
}

export class BookRepository implements IBookRepository {
  // info: get book by id
  async getBookById(id: string): Promise<IBook | null> {
    const book = await BookModel.findById(id).populate("genre", "name");
    return book;
  }
  // info: get all for admin
  async getAllBooksPaginated(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ books: IBook[]; total: number }> {
    const filter: QueryFilter<IBook> = {};

    if (search) {
      const orConditions: any[] = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];

      // Only add _id filter if valid ObjectId
      if (Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: new Types.ObjectId(search) });
      }

      filter.$or = orConditions;
    }

    const [books, total] = await Promise.all([
      BookModel.find(filter)
        .populate("genre", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size),
      BookModel.countDocuments(filter),
    ]);

    return { books, total };
  }
  async getAllBooks(): Promise<IBook[]> {
    const books = await BookModel.find().populate("Book", "name").lean().exec();
    return books;
  }

  async createBook(bookData: Partial<IBook>): Promise<IBook> {
    const book = new BookModel(bookData);
    return await book.save();
  }

  async getBookByTitle(title: string): Promise<IBook | null> {
    const book = await BookModel.findOne({ title: title });
    return book;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await BookModel.findByIdAndDelete(id);
    return result ? true : false;
  }
  //info: get by multiple ids
  async getBookByIds(ids: string[]): Promise<IBook[]> {
    return await BookModel.find({ _id: { $in: ids } });
  }
  // info: update book
  async updateBook(
    id: string,
    updatedData: Partial<IBook>,
  ): Promise<IBook | null> {
    const updatedBook = await BookModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    return updatedBook;
  }
}
