import { Request, Response } from "express";
import { BookService } from "../service/book.service";
import { CreateBookDTO } from "../dtos/book.dto";
import z from "zod";

const bookService = new BookService();

export class BookController {
  async createBook(req: Request, res: Response) {
    try {
      const parsedData = CreateBookDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res
          .status(404)
          .json({ error: z.prettifyError(parsedData.error) });
      }

      const bookData: CreateBookDTO = parsedData.data;

      const newBook = await bookService.createBook(bookData);

      return res.status(200).json({
        success: true,
        message: "New Book Created Successfully",
        data: newBook,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }

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
      return res
        .status(200)
        .json({ success: true, message: "Book retrieve successful" });
    } catch (error: Error | any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message ?? "Internal Server Error",
        });
    }
  }
}
