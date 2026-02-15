import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth Integration Test", () => {
  const testUser = {
    firstName: "test first name",
    lastName: "test last name",
    username: "test user",
    email: "test@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [{ email: testUser.email }, { username: testUser.username }],
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [{ email: testUser.email }, { username: testUser.username }],
    });
  });

  describe("POST /api/v1/auth/register", () => {
    test("should register a new user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should not register a user with existing email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty("message", "Email already in use");
    });

    test("should not register a user with existing username", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...testUser, email: "new@gmail.com" });

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty(
        "message",
        "Username already in use",
      );
    });
  });

  describe("POST /api/v1/auth/login", () => {
    test("Should login with an existing user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.token).toBeDefined();
    });

    test("should not login with incorrect password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: testUser.email, password: "wrongPassword!" });
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    test("Should not login with invalid email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "random@gmail.com", password: testUser.password });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found");
    });
  });

  describe("PUT /api/v1/auth/update-profile", () => {
    test("User cannot update their profile without token", async () => {
      const response = await request(app)
        .put("/api/v1/auth/update-profile")
        .send({
          firstName: "update test first name",
          lastName: "update test last name",
          username: "update test user",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/v1/auth/request-password-reset", () => {
    // test("request password reset succeeds", async () => {
    //   const res = await request(app)
    //     .post("/api/v1/auth/request-password-reset")
    //     .send({ email: testUser.email });
    //   expect(res.status).toBe(200);
    //   expect(res.body.success).toBe(true);
    // });

    test("request password reset fails for non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/request-password-reset")
        .send({ email: "fake@example.com" });
      expect(res.status).toBe(404);
    });
  });
});
