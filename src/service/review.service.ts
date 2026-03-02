import { Types } from "mongoose";
import { CreateReviewDTO, UpdateReviewDTO } from "../dtos/review.dto";
import { HttpError } from "../error/http-error";
import { IReview } from "../models/review.model";
import { ReviewRepository } from "../repository/review.repository";

let reviewRepository = new ReviewRepository();

export class ReviewService {
  async createReview(data: CreateReviewDTO): Promise<IReview> {
    return await reviewRepository.create(data);
  }

  async getAllReviews(
    page?: string,
    size?: string,
    search?: string,
  ): Promise<{
    reviews: IReview[];
    pagination: {
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { reviews, total } = await reviewRepository.getAllReview(
      pageNumber,
      pageSize,
      search,
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { reviews, pagination };
  }

  async deleteReview(id: string) {
    const review = await reviewRepository.getReviewById(id);
    if (!review) {
      throw new HttpError(404, "Review not found");
    }
    const deleted = await reviewRepository.deleteReview(id);
    return deleted;
  }

  async updateReview(id: string, updateData: UpdateReviewDTO) {
    const review = await reviewRepository.getReviewById(id);
    if (!review) {
      throw new HttpError(404, "Review not found");
    }
    const updatedReview = await reviewRepository.updateReview(id, updateData);
    return updatedReview;
  }

  async getReviewsByUserId(userId: string): Promise<IReview[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new HttpError(400, "Invalid user ID");
    }

    const reviews = await reviewRepository.getReviewByUserId(userId);

    return reviews;
  }

  async getReviewsByBookId(bookId: string): Promise<IReview[]> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new HttpError(400, "Invalid book ID");
    }

    const reviews = await reviewRepository.getReviewByBookId(bookId);

    return reviews;
  }
}
