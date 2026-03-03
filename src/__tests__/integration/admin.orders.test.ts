import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { UserModel } from "../../models/user.model";
import { OrderModel } from "../../models/order.model";
import { BookModel } from "../../models/book.model";

describe("Admin Orders Integration Test", () => {
  const adminUser = {
    firstName: "Admin",
    lastName: "Order",
    username: "adminorderuser",
    email: "adminorder@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalUser = {
    firstName: "Normal",
    lastName: "Order",
    username: "normalorderuser",
    email: "normalorder@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let adminToken: string;
  let userToken: string;
  let createdOrderId: string;
  let normalUserId: mongoose.Types.ObjectId;
  let createdBookId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await OrderModel.deleteMany({});
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
    normalUserId = user._id as mongoose.Types.ObjectId;

    userToken = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
    // Create a book (required for order.books)
    const book = await BookModel.create({
      title: "Test Book",
      author: "Test Author",
      description: "This is a test book",
      price: 50,
      stockAmount: 10,
      genre: [],
    });

    createdBookId = book._id as mongoose.Types.ObjectId;

    // Create order with NEW schema
    const order = await OrderModel.create({
      userId: normalUserId,
      books: [
        {
          bookId: createdBookId,
          quantity: 2,
        },
      ],
      totalPrice: 100,
      status: "pending",
    });

    createdOrderId = order._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await OrderModel.deleteMany({});
    await BookModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Authorization", () => {
    test("non-admin cannot access orders", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    test("admin can access orders", async () => {
      const res = await request(app)
        .get("/api/v1/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
    });
  });

  describe("Admin Order Management", () => {
    test("admin can update order status", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/orders/${createdOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "shipped",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Order updated successfully");
      expect(res.body.data.status).toBe("shipped");
    });

    test("admin can delete order", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/orders/${createdOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Order deleted successfully");
    });

    test("deleting non-existing order returns 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v1/admin/orders/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
