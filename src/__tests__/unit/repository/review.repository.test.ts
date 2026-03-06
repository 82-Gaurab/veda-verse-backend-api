import mongoose, { Schema } from "mongoose";
import { ReviewRepository } from "../../../repository/review.repository";
import { ReviewModel, IReview } from "../../../models/review.model";
import { BookModel } from "../../../models/book.model";

describe("Review Repository Unit Tests", () => {
  let reviewRepo: ReviewRepository;
  let testBookId: mongoose.Types.ObjectId;
  let testGenreId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    reviewRepo = new ReviewRepository();

    // Mock User model for populate
    const UserSchema = new Schema({
      username: String,
      profilePicture: String,
    });
    mongoose.model("User", UserSchema);

    // Minimal Genre model for Book reference
    const GenreSchema = new Schema({ name: { type: String, required: true } });
    const GenreModel = mongoose.model("Genre", GenreSchema);

    // Create genre and book for testing
    const genre = await GenreModel.create({ name: "Test Genre" });
    testGenreId = genre._id;

    const book = await BookModel.create({
      title: "Test Book",
      author: "Test Author",
      description: "Test description",
      genre: [testGenreId],
      price: 50,
      stockAmount: 10,
      publishedYear: "2025",
      coverImg: "test.jpg",
    });
    testBookId = book._id;
  });

  afterEach(async () => {
    await ReviewModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const getReviewData = (overrides = {}) => ({
    userId: new mongoose.Types.ObjectId().toString(),
    bookId: testBookId.toString(),
    rating: 4,
    title: "Great Book",
    comment: "Really enjoyed this book!",
    ...overrides,
  });

  // Create Review
  test("should create a new review", async () => {
    const newReview = await reviewRepo.create(getReviewData());
    expect(newReview).toBeDefined();
    expect(newReview.title).toBe("Great Book");
    expect(newReview.rating).toBe(4);
  });

  // Get Review by ID
  test("should get a review by ID", async () => {
    const created = await reviewRepo.create(getReviewData());
    const found = await reviewRepo.getReviewById(created._id.toString());
    expect(found).toBeDefined();
    expect(found?._id.toString()).toBe(created._id.toString());
  });

  // Get Review by ID - Not Found
  test("should return null for non-existent review ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await reviewRepo.getReviewById(fakeId);
    expect(found).toBeNull();
  });

  // Update Review
  test("should update a review", async () => {
    const created = await reviewRepo.create(getReviewData());
    const updated = await reviewRepo.updateReview(created._id.toString(), {
      rating: 5,
      comment: "Updated comment",
    });
    expect(updated).toBeDefined();
    expect(updated?.rating).toBe(5);
    expect(updated?.comment).toBe("Updated comment");
  });

  // Delete Review
  test("should delete a review by ID", async () => {
    const created = await reviewRepo.create(getReviewData());
    const deleted = await reviewRepo.deleteReview(created._id.toString());
    expect(deleted).toBe(true);

    const check = await reviewRepo.getReviewById(created._id.toString());
    expect(check).toBeNull();
  });

  // Delete Review - Non-existent
  test("should return false when deleting non-existent review", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const deleted = await reviewRepo.deleteReview(fakeId);
    expect(deleted).toBe(false);
  });

  // Get All Reviews (pagination + search)
  test("should get all reviews with pagination", async () => {
    await reviewRepo.create(getReviewData({ title: "First Review" }));
    await reviewRepo.create(getReviewData({ title: "Second Review" }));

    const { reviews, total } = await reviewRepo.getAllReview(1, 10);
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBe(2);
    expect(total).toBe(2);
  });

  test("should search reviews by title or comment", async () => {
    await reviewRepo.create(getReviewData({ title: "Special Title" }));
    await reviewRepo.create(getReviewData({ comment: "Unique Comment" }));

    const { reviews } = await reviewRepo.getAllReview(1, 10, "Special");
    expect(reviews.length).toBe(1);
    expect(reviews[0].title).toBe("Special Title");

    const { reviews: commentSearch } = await reviewRepo.getAllReview(
      1,
      10,
      "Unique",
    );
    expect(commentSearch.length).toBe(1);
    expect(commentSearch[0].comment).toBe("Unique Comment");
  });

  // Get Review by User ID
  test("should get reviews by user ID", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    await reviewRepo.create(getReviewData({ userId, title: "User Review" }));

    const userReviews = await reviewRepo.getReviewByUserId(userId);
    expect(userReviews.length).toBe(1);
    expect(userReviews[0].title).toBe("User Review");
    expect(userReviews[0].bookId).toBeDefined();
  });

  // Get Review by Book ID
  test("should get reviews by book ID", async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    await reviewRepo.create(getReviewData({ userId, title: "Book Review" }));

    const bookReviews = await reviewRepo.getReviewByBookId(
      testBookId.toString(),
    );
    expect(bookReviews.length).toBe(1);
    expect(bookReviews[0].title).toBe("Book Review");
    expect(bookReviews[0].userId).toBeDefined();
  });
});
