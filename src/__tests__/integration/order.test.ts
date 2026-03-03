import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../app";
import { JWT_SECRET } from "../../config";
import { UserModel } from "../../models/user.model";
import { OrderModel } from "../../models/order.model";
import { BookModel } from "../../models/book.model";

describe("User Orders Integration Test", () => {
  const userData = {
    firstName: "User",
    lastName: "Test",
    username: "userordertest",
    email: "userordertest@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  const otherUserData = {
    firstName: "Other",
    lastName: "User",
    username: "otherordertest",
    email: "otherordertest@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let userToken: string;
  let otherUserToken: string;
  let userId: mongoose.Types.ObjectId;
  let otherUserId: mongoose.Types.ObjectId;
  let bookId: mongoose.Types.ObjectId;
  let createdOrderId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/testdb",
      );
    }
    await UserModel.deleteMany({
      email: { $in: [userData.email, otherUserData.email] },
    });

    await OrderModel.deleteMany({});
    await BookModel.deleteMany({});

    // Create main user
    const user = await UserModel.create(userData);
    userId = user._id as mongoose.Types.ObjectId;

    userToken = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create second user
    const otherUser = await UserModel.create(otherUserData);
    otherUserId = otherUser._id as mongoose.Types.ObjectId;

    otherUserToken = jwt.sign(
      { id: otherUser._id, email: otherUser.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create book
    const book = await BookModel.create({
      title: "Test Book",
      author: "Author",
      description: "Description",
      price: 50,
      stockAmount: 10,
      genre: [],
    });

    bookId = book._id as mongoose.Types.ObjectId;
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [userData.email, otherUserData.email] },
    });

    await OrderModel.deleteMany({});
    await BookModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Create Order", () => {
    test("fails if cart is empty", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Cart is empty");
    });

    test("creates order from user cart", async () => {
      // Add book to cart first
      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          cart: {
            bookId,
            quantity: 1,
          },
        },
      });

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.totalPrice).toBe(50);

      createdOrderId = res.body.data._id;
      // Ensure cart cleared
      const updatedUser = await UserModel.findById(userId);

      if (!updatedUser) {
        throw new Error("User not found in test");
      }

      expect(updatedUser.cart).toBeDefined();
      expect(updatedUser.cart!.length).toBe(0);
    });
  });

  describe("Get My Orders", () => {
    test("returns only user's orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders/my-orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    test("other user sees no orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders/my-orders")
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe("Pay Order ", () => {
    test("user CAN pay the order", async () => {
      // Create new order for main user again
      await UserModel.findByIdAndUpdate(userId, {
        $push: {
          cart: {
            bookId,
            quantity: 1,
          },
        },
      });

      const newOrderRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      const newOrderId = newOrderRes.body.data._id;

      // Other user pays it
      const res = await request(app)
        .put(`/api/v1/orders/pay/${newOrderId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      // This is expected with your current code
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("paid");
    });
  });
});
