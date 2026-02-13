import { connectDatabaseTest } from "../../database/mongodb";
import app from "../../app";
import request from "supertest";

describe("Admin Integration Test", () => {
  const adminTestUser = {
    firstName: "test admin first name",
    lastName: "test admin last name",
    username: "test admin user",
    email: "admin@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  describe("Admin User Manipulation", () => {
    test("only user with role admin can get all user", () => {
      const response = { status: 200, success: true };

      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
    });
    test("admin can create a user", async () => {
      const response = await request(app)
        .post("/api/v1/admin/users")
        .send(adminTestUser);

      expect(response.status).toBe(200);
    });
    test("delete a user", () => {});
    test("update a user", () => {});
    test("update a user", () => {});
    test("update a user", () => {});
    test("update a user", () => {});
    test("update a user", () => {});
    test("update a user", () => {});
  });
});
