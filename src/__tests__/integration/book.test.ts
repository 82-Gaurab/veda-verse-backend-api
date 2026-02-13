import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Book Integration Test", () => {
  const testBook = {
    id: "101",
    title: "Flow",
  };

  beforeAll(async () => {
    UserModel.deleteMany({
      $or: [{ id: testBook.id }],
    });
  });

  afterAll(async () => {
    UserModel.deleteMany({
      $or: [{ id: testBook.id }],
    });
  });

  describe("POST /api/v1/books", () => {
    test("Should create a new book", async () => {
      const response = await request(app).post("/api/v1/books/").send(testBook);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should not create a book with existing id", async () => {
      const response = await request(app)
        .post("/api/v1/books/")
        .send({ ...testBook, title: "MockingBird" });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message", "Book ID already exists");
      expect(response.body).toHaveProperty("success", false);
    });

    test("should not create a book without an id", async () => {
      const response = await request(app)
        .post("/api/v1/books/")
        .send({ title: "MockingBird" });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/books/", () => {
    test("should retrieve all books", async () => {
      const response = await request(app).get("/api/v1/books/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should retrieve book by id", async () => {
      const response = await request(app).get(`/api/v1/books/${testBook.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should not retrieve book of an invalid id", async () => {
      const response = await request(app).get(`/api/v1/books/987987`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});
