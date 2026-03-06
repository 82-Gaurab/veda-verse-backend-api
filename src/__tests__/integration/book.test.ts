import app from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import { BookModel, IBook } from "../../models/book.model";

describe("Public Book Routes Integration Test", () => {
  let bookId: string;
  let genreId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/testdb",
      );
    }

    // Clean up existing books
    await BookModel.deleteMany({});

    // Insert a sample book
    genreId = new mongoose.Types.ObjectId();
    const book: IBook = await BookModel.create({
      title: "Test Book",
      author: "John Doe",
      description: "A test book description",
      genre: [genreId],
      price: 19.99,
      stockAmount: 10,
      publishedYear: "2023",
      coverImg: "cover.jpg",
    });

    bookId = book._id.toString();
  });

  afterAll(async () => {
    await BookModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/v1/books", () => {
    test("should fetch all books", async () => {
      const res = await request(app).get("/api/v1/books");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should fetch books with search query", async () => {
      const res = await request(app).get("/api/v1/books?search=Test");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].title).toContain("Test");
    });
  });

  describe("GET /api/v1/books/:id", () => {
    test("should fetch a book by its ID", async () => {
      const res = await request(app).get(`/api/v1/books/${bookId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(bookId);
      expect(res.body.data.title).toBe("Test Book");
    });

    test("should return 500 for invalid ID", async () => {
      const res = await request(app).get("/api/v1/books/invalidId");
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/books/genre/:genreId", () => {
    test("should fetch books by genre ID", async () => {
      const res = await request(app).get(
        `/api/v1/books/genre/${genreId.toString()}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
