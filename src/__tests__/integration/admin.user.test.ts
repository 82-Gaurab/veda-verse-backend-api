import app from "../../app";
import jwt from "jsonwebtoken";
import request from "supertest";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";
import { JWT_SECRET } from "../../config";

describe("Admin Integration Test", () => {
  const adminTestUser = {
    firstName: "test admin first name",
    lastName: "test admin last name",
    username: "test admin user",
    email: "admin@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalTestUser = {
    email: "testuser@example.com",
    firstName: "test1 first name",
    lastName: "test1 last name",
    username: "test1 user",
    password: "123456789",
    confirmPassword: "123456789",
  };

  const adminCreateUser = {
    firstName: "test first name",
    lastName: "test last name",
    username: "test5 user",
    email: "test125@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Clean up both admin and normal test users
    await UserModel.deleteMany({
      email: {
        $in: [adminTestUser.email, normalTestUser.email, adminCreateUser.email],
      },
    });

    // Create admin
    const admin = await UserModel.create(adminTestUser);

    // Create JWT for admin manually
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create normal user
    const user = await UserModel.create(normalTestUser);

    authToken = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
  });

  afterAll(async () => {
    // Clean up both users
    await UserModel.deleteMany({
      email: {
        $in: [adminTestUser.email, normalTestUser.email, adminCreateUser.email],
      },
    });
    await mongoose.connection.close();
  });

  describe("Admin User Manipulation", () => {
    test("only user with role admin can get all users", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    test("non-admin cannot access admin route", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(403);
    });

    test("admin route responds with success format", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
    test("admin can create a user", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .send(adminCreateUser)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
    });
  });
});
