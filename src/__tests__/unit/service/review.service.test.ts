import mongoose from "mongoose";
import { ReviewService } from "../../../service/review.service";
import { ReviewRepository } from "../../../repository/review.repository";
import { IReview } from "../../../models/review.model";
import { HttpError } from "../../../error/http-error";

// --- Mocks ---
jest.mock("../../../repository/review.repository");

describe("ReviewService Unit Tests", () => {
  let reviewService: ReviewService;

  const repo = {
    create: jest.spyOn(ReviewRepository.prototype, "create"),
    getAllReview: jest.spyOn(ReviewRepository.prototype, "getAllReview"),
    getReviewById: jest.spyOn(ReviewRepository.prototype, "getReviewById"),
    updateReview: jest.spyOn(ReviewRepository.prototype, "updateReview"),
    deleteReview: jest.spyOn(ReviewRepository.prototype, "deleteReview"),
    getReviewByUserId: jest.spyOn(
      ReviewRepository.prototype,
      "getReviewByUserId",
    ),
    getReviewByBookId: jest.spyOn(
      ReviewRepository.prototype,
      "getReviewByBookId",
    ),
  };

  const fakeReview: Partial<IReview> = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    bookId: new mongoose.Types.ObjectId(),
    rating: 5,
    title: "Great Book",
    comment: "Loved it",
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reviewService = new ReviewService();
  });

  // -------------------- CREATE REVIEW --------------------
  it("should create a new review", async () => {
    const reviewData = {
      userId: new mongoose.Types.ObjectId().toString(),
      bookId: new mongoose.Types.ObjectId().toString(),
      rating: 5,
      title: "Amazing",
      comment: "Highly recommend",
    };
    repo.create.mockResolvedValue({
      ...reviewData,
      _id: new mongoose.Types.ObjectId(),
    } as any);

    const review = await reviewService.createReview(reviewData);
    expect(repo.create).toHaveBeenCalledWith(reviewData);
    expect(review.title).toBe(reviewData.title);
  });

  // -------------------- GET ALL REVIEWS PAGINATED --------------------
  it("should get all reviews with default page/size", async () => {
    repo.getAllReview.mockResolvedValue({
      reviews: [fakeReview as any],
      total: 1,
    });

    const result = await reviewService.getAllReviews();
    expect(repo.getAllReview).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.reviews).toHaveLength(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("should get all reviews with custom page/size/search", async () => {
    repo.getAllReview.mockResolvedValue({
      reviews: [fakeReview as any],
      total: 5,
    });

    const result = await reviewService.getAllReviews("2", "2", "Great");
    expect(repo.getAllReview).toHaveBeenCalledWith(2, 2, "Great");
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.size).toBe(2);
    expect(result.pagination.totalItems).toBe(5);
    expect(result.pagination.totalPages).toBe(3);
  });

  // -------------------- GET REVIEW BY ID --------------------
  it("should update a review", async () => {
    const updateData = { rating: 4, comment: "Good read" };
    repo.getReviewById.mockResolvedValue(fakeReview as any);
    repo.updateReview.mockResolvedValue({
      ...fakeReview,
      ...updateData,
    } as any);

    const updated = await reviewService.updateReview(
      fakeReview._id!.toString(),
      updateData,
    );
    expect(repo.getReviewById).toHaveBeenCalledWith(fakeReview._id!.toString());
    expect(repo.updateReview).toHaveBeenCalledWith(
      fakeReview._id!.toString(),
      updateData,
    );
    expect(updated!.rating).toBe(updateData.rating);
    expect(updated!.comment).toBe(updateData.comment);
  });

  it("should throw 404 if review to update not found", async () => {
    repo.getReviewById.mockResolvedValue(null);
    await expect(
      reviewService.updateReview("missingId", { rating: 3 }),
    ).rejects.toThrow(new HttpError(404, "Review not found"));
  });

  // -------------------- DELETE REVIEW --------------------
  it("should delete a review", async () => {
    repo.getReviewById.mockResolvedValue(fakeReview as any);
    repo.deleteReview.mockResolvedValue(true);

    const deleted = await reviewService.deleteReview(
      fakeReview._id!.toString(),
    );
    expect(repo.getReviewById).toHaveBeenCalledWith(fakeReview._id!.toString());
    expect(repo.deleteReview).toHaveBeenCalledWith(fakeReview._id!.toString());
    expect(deleted).toBe(true);
  });

  it("should throw 404 if review to delete not found", async () => {
    repo.getReviewById.mockResolvedValue(null);
    await expect(reviewService.deleteReview("missingId")).rejects.toThrow(
      new HttpError(404, "Review not found"),
    );
  });

  // -------------------- GET REVIEWS BY USER ID --------------------
  it("should get reviews by user ID", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    repo.getReviewByUserId.mockResolvedValue([fakeReview as any]);

    const reviews = await reviewService.getReviewsByUserId(userId);
    expect(repo.getReviewByUserId).toHaveBeenCalledWith(userId);
    expect(reviews).toHaveLength(1);
  });

  it("should throw 400 for invalid user ID", async () => {
    await expect(reviewService.getReviewsByUserId("invalidId")).rejects.toThrow(
      new HttpError(400, "Invalid user ID"),
    );
  });

  // -------------------- GET REVIEWS BY BOOK ID --------------------
  it("should get reviews by book ID", async () => {
    const bookId = new mongoose.Types.ObjectId().toString();
    repo.getReviewByBookId.mockResolvedValue([fakeReview as any]);

    const reviews = await reviewService.getReviewsByBookId(bookId);
    expect(repo.getReviewByBookId).toHaveBeenCalledWith(bookId);
    expect(reviews).toHaveLength(1);
  });

  it("should throw 400 for invalid book ID", async () => {
    await expect(reviewService.getReviewsByBookId("invalidId")).rejects.toThrow(
      new HttpError(400, "Invalid book ID"),
    );
  });
});
