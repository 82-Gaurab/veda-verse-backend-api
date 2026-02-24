import { Request, Response } from "express";
import { ReviewService } from "../service/review.service";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";
import z from "zod";
import { QueryParams } from "../types/query.type";

let reviewService = new ReviewService();
export class ReviewController {
  // info: Create Review
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const parsedData = CreateReviewDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(404).json({
          error: z.prettifyError(parsedData.error),
        });
      }

      const reviewData = parsedData.data;

      const review = await reviewService.createReview(reviewData);

      return res.status(200).json({
        success: true,
        data: review,
        message: "New Review Created Successfully",
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

      const { reviews, pagination } = await reviewService.getAllReviews(
        page,
        size,
        search,
      );

      return res.status(200).json({
        success: true,
        data: reviews,
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

  // info: Delete Review
  async deleteReview(req: Request, res: Response) {
    try {
      const reviewId = req.params.id;
      const deleted = await reviewService.deleteReview(reviewId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Review not found" });
      }
      return res.status(200).json({ success: true, message: "Review Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // info: Update Review
  async updateReview(req: Request, res: Response): Promise<Response> {
    try {
      const reviewId = req.params.id;

      const parsedData = UpdateReviewDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: z.prettifyError(parsedData.error),
        });
      }

      const updateData = parsedData.data;

      const updatedReview = await reviewService.updateReview(
        reviewId,
        updateData,
      );

      return res.status(200).json({
        success: true,
        message: "Review Updated Successfully",
        data: updatedReview,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }

  // info: Get Review By User ID
  async getReviewsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const reviews = await reviewService.getReviewsByUserId(userId);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
        message: "All Reviews for the userId retrieved successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }

  // info: Get Review By Book ID
  async getReviewsByBookId(req: Request, res: Response) {
    try {
      const { bookId } = req.params;

      const reviews = await reviewService.getReviewsByBookId(bookId);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
        message: "All Reviews for the bookId retrieved successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }
}
