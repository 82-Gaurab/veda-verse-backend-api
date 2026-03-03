import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { UserModel } from "../../models/user.model";
import { GenreModel } from "../../models/genre.model";

describe("Admin Genres Integration Test", () => {
  const adminUser = {
    firstName: "Admin",
    lastName: "Genre",
    username: "admingenreuser",
    email: "admingenre@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalUser = {
    firstName: "Normal",
    lastName: "Genre",
    username: "normalgenreuser",
    email: "normalgenre@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let adminToken: string;
  let userToken: string;
  let createdGenreId: string;

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminUser.email, normalUser.email] },
    });

    await GenreModel.deleteMany({});

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

    await GenreModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Authorization", () => {
    test("non-admin cannot access genre routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/genres")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    test("admin can access genre routes", async () => {
      const res = await request(app)
        .get("/api/v1/admin/genres")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
    });
  });

  describe("Admin Genre CRUD", () => {
    test("admin can create genre", async () => {
      const res = await request(app)
        .post("/api/v1/admin/genres")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Fantasy",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      createdGenreId = res.body.data._id;
    });

    test("admin can get all genres (non-paginated)", async () => {
      const res = await request(app)
        .get("/api/v1/admin/genres/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("admin can get genre by id", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/genres/${createdGenreId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdGenreId);
    });

    test("admin can update genre", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/genres/${createdGenreId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Fantasy",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Genre Updated Successfully");
      expect(res.body.data.name).toBe("Updated Fantasy");
    });

    test("admin can delete genre", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/genres/${createdGenreId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Genre Deleted");
    });

    test("deleting non-existing genre returns 404", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v1/admin/genres/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Validation", () => {
    test("creating invalid genre returns 404 (DTO validation)", async () => {
      const res = await request(app)
        .post("/api/v1/admin/genres")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "", // invalid
        });

      expect(res.status).toBe(404);
    });

    test("updating genre with invalid data returns 400", async () => {
      const genre = await GenreModel.create({
        name: "Temp Genre",
      });

      const res = await request(app)
        .put(`/api/v1/admin/genres/${genre._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "", // invalid
        });

      expect(res.status).toBe(400);
    });
  });
});
