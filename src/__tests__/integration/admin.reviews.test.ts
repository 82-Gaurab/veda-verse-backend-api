import app from "../../app";
import jwt from "jsonwebtoken";
import request from "supertest";
import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";
import { ReviewModel, IReview } from "../../models/review.model";
import { JWT_SECRET } from "../../config";

describe("Admin Review Integration Test", () => {
  const adminTestUser = {
    firstName: "test admin",
    lastName: "admin last",
    username: "adminuser",
    email: "adminreview@test.com",
    password: "123456789",
    confirmPassword: "123456789",
    role: "admin",
  };

  const normalUser = {
    firstName: "Normal",
    lastName: "Order",
    username: "normalReviewGuy",
    email: "normalreviewguy1@test.com",
    password: "123456789",
    confirmPassword: "123456789",
  };

  let adminToken: string;
  let userToken: string;
  let reviewId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/testdb",
      );
    }

    // Cleanup previous test users & reviews
    await UserModel.deleteMany({ email: adminTestUser.email });
    await ReviewModel.deleteMany({});

    const user = await UserModel.create(normalUser);

    userToken = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create admin user
    const admin = await UserModel.create(adminTestUser);

    // Generate admin JWT
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Create a sample review
    const review = await ReviewModel.create({
      userId: admin._id,
      bookId: new mongoose.Types.ObjectId(),
      rating: 5,
      title: "Amazing Book",
      comment: "Loved it!",
    });

    reviewId = review._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: adminTestUser.email });
    await ReviewModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/v1/admin/reviews", () => {
    it("should allow admin to fetch paginated reviews", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reviews?page=1&size=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.message).toBe("All Reviews Retrieved");
    });

    it("should forbid non-admin from accessing reviews", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reviews")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Forbidden Admins Only");
    });

    it("should return 401 when token is missing", async () => {
      const res = await request(app).get("/api/v1/admin/reviews");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Unauthorized/);
    });
  });
});
