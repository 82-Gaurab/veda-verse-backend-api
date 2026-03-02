import { QueryFilter } from "mongoose";
import { CreateReviewDTO } from "../dtos/review.dto";
import { IReview, ReviewModel } from "../models/review.model";

export class ReviewRepository {
  async create(data: CreateReviewDTO): Promise<IReview> {
    const review = new ReviewModel(data);
    return await review.save();
  }
  // info: delete review - only admin
  async deleteReview(id: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(id);
    return result ? true : false;
  }

  // info: get all for admin
  async getAllReview(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ reviews: IReview[]; total: number }> {
    const filter: QueryFilter<IReview> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const [reviews, total] = await Promise.all([
      ReviewModel.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip((page - 1) * size)
        .limit(size),
      ReviewModel.countDocuments(filter),
    ]);

    return { reviews, total };
  }

  // info: update review
  async updateReview(
    id: string,
    updatedData: Partial<IReview>,
  ): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
  }

  async getReviewByUserId(userId: string): Promise<IReview[]> {
    return await ReviewModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate("bookId", "title price");
  }

  async getReviewByBookId(bookId: string): Promise<IReview[]> {
    return await ReviewModel.find({ bookId })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture");
  }

  async getReviewById(reviewId: string): Promise<IReview | null> {
    const review = await ReviewModel.findById(reviewId);
    return review;
  }
}
