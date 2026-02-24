import { Request, Response } from "express";
import { BookService } from "../service/book.service";

const bookService = new BookService();

export class BookController {
  async getAllBooks(req: Request, res: Response) {
    try {
      const books = await bookService.getAllBooks();
      return res.status(200).json({
        success: true,
        message: "All book retrieved successfully",
        data: books,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }

  async getBookById(req: Request, res: Response) {
    try {
      const bookId = req.params.id;
      const book = await bookService.getBookById(bookId);
      return res.status(200).json({
        success: true,
        data: book,
        message: "Book retrieve successful",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }
}
