import { Request, Response } from "express";
import { BookService } from "../service/book.service";

const bookService = new BookService();

export class BookController {
  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;

      const books = await bookService.getAllBooks(search);

      res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Error fetching books:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch books",
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

  async getBooksByGenre(req: Request, res: Response) {
    try {
      const { genreId } = req.params;

      if (!genreId) {
        return res.status(400).json({ message: "Genre ID is required" });
      }

      const books = await bookService.getBooksByGenre(genreId);

      return res.status(200).json({ success: true, data: books });
    } catch (error) {
      console.error("Error fetching books by genre:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
