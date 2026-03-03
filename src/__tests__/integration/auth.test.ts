import app from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import { UserModel, IUser } from "../../models/user.model";

describe("User Authentication Integration Test", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    username: "testuser",
    email: "testuser@example.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/testdb",
      );
    }

    // Clean up previous test user
    await UserModel.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  describe("User Registration & Login", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);

      userId = res.body.data._id;
    });

    it("should login the registered user", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      authToken = res.body.token;
    });
  });

  describe("User Protected Routes", () => {
    it("should get current user data with valid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it("should update user profile", async () => {
      const res = await request(app)
        .put("/api/v1/auth/update-profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ firstName: "Updated", lastName: "User" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe("Updated");
      expect(res.body.data.lastName).toBe("User");
    });

    it("should add item to cart", async () => {
      const res = await request(app)
        .put("/api/v1/auth/cart")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ product: new mongoose.Types.ObjectId(), quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart).toBeInstanceOf(Array);
      expect(res.body.data.cart[0].quantity).toBe(2);
    });

    it("should fail accessing protected route without token", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Unauthorized/);
    });
  });
});
