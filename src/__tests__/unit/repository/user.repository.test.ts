import mongoose from "mongoose";
import { UserRepository } from "../../../repository/user.repository";
import { UserModel } from "../../../models/user.model";

describe("UserRepository Unit Tests", () => {
  let userRepo: UserRepository;
  let testUserId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
    }
    userRepo = new UserRepository();
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});

    const user = await userRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "123456",
    });
    testUserId = user._id.toString();
  });

  const getUserData = (overrides = {}) => ({
    firstName: "Alice",
    lastName: "Smith",
    username: "alicesmith",
    email: "alice@example.com",
    password: "abcdef",
    ...overrides,
  });

  test("should create a new user", async () => {
    const newUser = await userRepo.createUser(getUserData());
    expect(newUser).toBeDefined();
    expect(newUser.email).toBe("alice@example.com");
    expect(newUser).toHaveProperty("_id");
  });

  test("should get user by email", async () => {
    const user = await userRepo.getUserByEmail("john@example.com");
    expect(user).not.toBeNull();
    expect(user!.username).toBe("johndoe");
  });

  test("should get user by username", async () => {
    const user = await userRepo.getUserByUsername("johndoe");
    expect(user).not.toBeNull();
    expect(user!.email).toBe("john@example.com");
  });

  test("should update a user", async () => {
    const updated = await userRepo.updateUser(testUserId, {
      firstName: "Johnny",
    });
    expect(updated).not.toBeNull();
    expect(updated!.firstName).toBe("Johnny");
  });

  test("should get all users with pagination", async () => {
    await userRepo.createUser(getUserData());
    const { users, total } = await userRepo.getAllUsers(1, 10);
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(total).toBeGreaterThanOrEqual(2);
  });

  test("should delete a user", async () => {
    const result = await userRepo.deleteUser(testUserId);
    expect(result).toBe(true);
    const user = await userRepo.getUserById(testUserId);
    expect(user).toBeNull();
  });

  test("should add a book to cart and increment quantity", async () => {
    const bookId = new mongoose.Types.ObjectId().toString();
    let user = await userRepo.addToCart(testUserId, {
      product: bookId,
      quantity: 2,
    });
    expect(user).toBeDefined();
    expect(user!.cart).toBeDefined();
    expect(user!.cart!.length).toBe(1);
    expect(user!.cart![0].quantity).toBe(2);
    expect(user!.cart![0].bookId.toString()).toBe(bookId);

    // Add same book again
    user = await userRepo.addToCart(testUserId, {
      product: bookId,
      quantity: 3,
    });
    expect(user).toBeDefined();
    expect(user!.cart).toBeDefined();
    expect(user!.cart!.length).toBe(1);
    expect(user!.cart![0].quantity).toBe(5);
  });

  test("should return uploaded profile picture filename", async () => {
    const fileMock = { filename: "profile.png" } as Express.Multer.File;
    const filename = await userRepo.uploadProfilePicture(fileMock);
    expect(filename).toBe("profile.png");
  });
});
