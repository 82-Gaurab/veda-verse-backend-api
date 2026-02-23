import { Request, Response } from "express";

import z from "zod";
import { GenreService } from "../service/genre.service";
import { CreateGenreDTO, UpdateGenreDTO } from "../dtos/genre.dto";
import { QueryParams } from "../types/query.type";

const genreService = new GenreService();

export class GenreController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const parsedData = CreateGenreDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(404)
          .json({ error: z.prettifyError(parsedData.error) });
      }

      const genreData: CreateGenreDTO = parsedData.data;

      const genre = await genreService.createGenre(genreData);

      return res.status(201).json({
        success: true,
        data: genre,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }

  async getAllGenres(req: Request, res: Response) {
    try {
      const genres = await genreService.getAllGenres();
      return res.status(200).json({
        success: true,
        data: genres,
        message: "All Genres Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllPaginated(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;

      const { genres, pagination } = await genreService.getAllGenresPaginated(
        page,
        size,
        search,
      );

      return res.status(200).json({
        success: true,
        data: genres,
        pagination: pagination,
        message: "All Genres Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteGenre(req: Request, res: Response) {
    try {
      const genreId = req.params.id;
      const deleted = await genreService.deleteGenre(genreId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Genre not found" });
      }
      return res.status(200).json({ success: true, message: "Genre Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateGenre(req: Request, res: Response): Promise<Response> {
    try {
      const genreId = req.params.id;

      const parsedData = UpdateGenreDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: z.prettifyError(parsedData.error),
        });
      }

      const updateData = parsedData.data;

      const updatedGenre = await genreService.updateGenre(genreId, updateData);

      return res.status(200).json({
        success: true,
        message: "Genre Updated Successfully",
        data: updatedGenre,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }
}
