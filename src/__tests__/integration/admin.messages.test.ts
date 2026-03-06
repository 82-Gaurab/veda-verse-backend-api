import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { UserModel } from "../../models/user.model";
import { MessageModel } from "../../models/message.model";

describe("Admin Messages Integration Test", () => {
  const adminUser = {
    firstName: "Admin",
    lastName: "Message",
    username: "adminmessageuser",
    email: "adminmessage@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalUser = {
    firstName: "Normal",
    lastName: "Message",
    username: "normalmessageuser",
    email: "normalmessage@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let adminToken: string;
  let userToken: string;
  let createdMessageId: string;

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await MessageModel.deleteMany({});

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

    // Seed message directly in DB
    const message = await MessageModel.create({
      username: "Test User",
      userEmail: "test@example.com",
      message: "This is a test message",
      isTestimonial: false,
    });

    createdMessageId = message._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await MessageModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Authorization", () => {
    test("non-admin cannot access messages", async () => {
      const res = await request(app)
        .get("/api/v1/admin/messages")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    test("admin can access messages", async () => {
      const res = await request(app)
        .get("/api/v1/admin/messages")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("Admin Message Management", () => {
    test("admin can update message", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/messages/${createdMessageId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isTestimonial: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isTestimonial).toBe(true);
    });

    test("admin can delete message", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/messages/${createdMessageId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("deleting non-existing message returns 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v1/admin/messages/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
