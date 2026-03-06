import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { UserModel } from "../../models/user.model";
import { BookModel } from "../../models/book.model";

describe("Admin Books Integration Test", () => {
  const adminUser = {
    firstName: "Admin",
    lastName: "User",
    username: "adminbookuser",
    email: "adminbook@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalUser = {
    firstName: "Normal",
    lastName: "User",
    username: "normalbookuser",
    email: "normalbook@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let adminToken: string;
  let userToken: string;
  let createdBookId: string;

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await BookModel.deleteMany({});

    // Create admin
    const admin = await UserModel.create(adminUser);
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create normal user
    const user = await UserModel.create(normalUser);

    userToken = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await BookModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Authorization", () => {
    test("non-admin cannot access book routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/books")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    test("admin can access book routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/books")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
    });
  });

  describe("Admin Book CRUD", () => {
    test("admin can create a book", async () => {
      const res = await request(app)
        .post("/api/v1/admin/books")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Book",
          author: "Test Author",
          description: "Test Description",
          price: 100,
          stockAmount: 10,
          genre: [],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("New Book Created Successfully");

      createdBookId = res.body.data._id;
    });

    test("admin can get all books (paginated)", async () => {
      const res = await request(app)
        .get("/api/v1/admin/books?page=1&size=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("pagination");
    });

    test("admin can update a book", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/books/${createdBookId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Updated Book Title",
          price: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Book Updated Successfully");
      expect(res.body.data.title).toBe("Updated Book Title");
      expect(res.body.data.price).toBe(150);
    });

    test("admin can delete a book", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/books/${createdBookId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Book Deleted");
    });

    test("deleting non-existing book returns 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v1/admin/books/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Validation", () => {
    test("creating book with invalid data returns 404 (DTO validation)", async () => {
      const res = await request(app)
        .post("/api/v1/admin/books")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "", // invalid
        });

      expect(res.status).toBe(404);
    });

    test("updating book with invalid data returns 400", async () => {
      const book = await BookModel.create({
        title: "Temp Book",
        author: "Temp Author",
        description: "Temp",
        price: 50,
        stockAmount: 5,
        genre: [],
      });

      const res = await request(app)
        .put(`/api/v1/admin/books/${book._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          price: "invalid", // fails number conversion
        });

      expect(res.status).toBe(400);
    });
  });
});
