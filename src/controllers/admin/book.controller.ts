import { CreateBookDTO } from "../../dtos/book.dto";
import { Request, Response } from "express";
import z from "zod";
import { AdminBookService } from "../../service/admin/book.service";
import { QueryParams } from "../../types/query.type";

let adminBookService = new AdminBookService();

export class AdminBookController {
  async createBook(req: Request, res: Response) {
    try {
      const parsedData = CreateBookDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res
          .status(404)
          .json({ error: z.prettifyError(parsedData.error) });
      }
      if (req.file) {
        parsedData.data.coverImg = `/uploads/books/${req.file.filename}`;
      }

      const bookData: CreateBookDTO = parsedData.data;

      const newBook = await adminBookService.createBook(bookData);

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

  // info: Get All paginated
  async getAllPaginated(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;

      const { books, pagination } = await adminBookService.getAllBookPaginated(
        page,
        size,
        search,
      );

      return res.status(200).json({
        success: true,
        data: books,
        pagination: pagination,
        message: "All Reviews Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteBook(req: Request, res: Response) {
    try {
      const bookId = req.params.id;
      const deleted = await adminBookService.deleteBook(bookId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Book not found" });
      }
      return res.status(200).json({ success: true, message: "Book Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
