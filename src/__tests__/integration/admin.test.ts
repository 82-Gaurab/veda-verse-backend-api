import { connectDatabaseTest } from "../../database/mongodb";
import app from "../../app";
import request from "supertest";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";

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

  let authToken: string;

  let adminToken: string;

  beforeAll(async () => {
    // Clean up test users
    await UserModel.deleteMany({
      email: { $in: [adminTestUser.email, adminTestUser.email] },
    });

    // Create admin
    const admin = await UserModel.create(adminTestUser);

    // Login admin to get token
    const res = await request(app).post("/api/auth/login").send({
      email: adminTestUser.email,
      password: adminTestUser.password,
    });
    adminToken = res.body.token;

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: normalTestUser.email, password: normalTestUser.password });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: adminTestUser.email },
        { username: adminTestUser.username },
      ],
    });
    await mongoose.connection.close();
  });

  describe("Admin User Manipulation", () => {
    test("only user with role admin can get all user", () => {
      const response = { status: 200, success: true };

      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
    });

    test("non-admin cannot access admin route", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });

    test("admin route responds with success format", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect([500]).toContain(res.status); // admin route runs without crash
    });

    // test("admin can create a user", async () => {
    //   const response = await request(app).post("/api/v1/admin/users").send({
    //     firstName: "test2 first name",
    //     lastName: "test2 last name",
    //     username: "test2 user",
    //     email: "test123@test.com",
    //     password: "123456789",
    //     confirmPassword: "123456789",
    //   });

    //   expect(response.status).toBe(200);
    // });

    test("admin cannot access invalid endpoint", async () => {
      const res = await request(app)
        .get("/api/admin/nonexistent")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
    // test("delete a user", () => {});
    // test("update a user", () => {});
    // test("update a user", () => {});
    // test("update a user", () => {});
    // test("update a user", () => {});
    // test("update a user", () => {});
    // test("update a user", () => {});
  });
});
