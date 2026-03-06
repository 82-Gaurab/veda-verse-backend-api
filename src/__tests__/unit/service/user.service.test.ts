import { UserService } from "../../../service/user.service";
import { UserRepository } from "../../../repository/user.repository";
import { HttpError } from "../../../error/http-error";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../../../config/email";

// --- Mocks ---
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/email");

describe("UserService Unit Tests", () => {
  let userService: UserService;

  const fakeUser = {
    _id: "user123",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "hashed_pw",
    role: "user",
  };

  const repo = {
    getUserByEmail: jest.spyOn(UserRepository.prototype, "getUserByEmail"),
    getUserByUsername: jest.spyOn(
      UserRepository.prototype,
      "getUserByUsername",
    ),
    getUserById: jest.spyOn(UserRepository.prototype, "getUserById"),
    createUser: jest.spyOn(UserRepository.prototype, "createUser"),
    updateUser: jest.spyOn(UserRepository.prototype, "updateUser"),
    addToCart: jest.spyOn(UserRepository.prototype, "addToCart"),
    getUserCart: jest.spyOn(UserRepository.prototype, "getUserCart"),
    uploadProfilePicture: jest.spyOn(
      UserRepository.prototype,
      "uploadProfilePicture",
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(); // uses the module-level repo internally
  });

  // CREATE USER
  it("should throw 403 if email already exists", async () => {
    repo.getUserByEmail.mockResolvedValue(fakeUser as any);

    await expect(
      userService.createUser({
        firstName: "New",
        lastName: "User",
        username: "newuser",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).rejects.toThrow(new HttpError(403, "Email already in use"));
  });

  it("should throw 403 if username already exists", async () => {
    repo.getUserByEmail.mockResolvedValue(null);
    repo.getUserByUsername.mockResolvedValue(fakeUser as any);

    await expect(
      userService.createUser({
        firstName: "New",
        lastName: "User",
        username: "johndoe",
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      }),
    ).rejects.toThrow(new HttpError(403, "Username already in use"));
  });

  it("should hash password and create user", async () => {
    repo.getUserByEmail.mockResolvedValue(null);
    repo.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed_pw");
    repo.createUser.mockResolvedValue(fakeUser as any);

    const result = await userService.createUser({
      firstName: "New",
      lastName: "User",
      username: "newuser",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(bcryptjs.hash).toHaveBeenCalledWith("password123", 10);
    expect(repo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed_pw" }),
    );
    expect(result).toEqual(fakeUser);
  });

  // LOGIN
  it("should throw 404 if user not found during login", async () => {
    repo.getUserByEmail.mockResolvedValue(null);

    await expect(
      userService.loginUser({
        email: "unknown@example.com",
        password: "pw123",
      }),
    ).rejects.toThrow(new HttpError(404, "No user found"));
  });

  it("should throw 401 if password is invalid", async () => {
    repo.getUserByEmail.mockResolvedValue(fakeUser as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.loginUser({ email: "john@example.com", password: "wrong" }),
    ).rejects.toThrow(new HttpError(401, "Invalid Credentials"));
  });

  it("should login and return token on valid credentials", async () => {
    repo.getUserByEmail.mockResolvedValue(fakeUser as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mock_token");

    const result = await userService.loginUser({
      email: "john@example.com",
      password: "password123",
    });

    expect(result).toEqual({ token: "mock_token", user: fakeUser });
  });

  // UPDATE USER
  it("should throw 404 if user to update not found", async () => {
    repo.getUserById.mockResolvedValue(null);

    await expect(
      userService.updateUser("user123", { firstName: "Updated" }),
    ).rejects.toThrow(new HttpError(404, "User not found"));
  });

  it("should update user and hash new password", async () => {
    repo.getUserById.mockResolvedValue(fakeUser as any);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("new_hashed_pw");
    repo.updateUser.mockResolvedValue({
      ...fakeUser,
      password: "new_hashed_pw",
    } as any);

    const result = await userService.updateUser("user123", {
      password: "newpass",
    });
    expect(bcryptjs.hash).toHaveBeenCalledWith("newpass", 10);
    expect(repo.updateUser).toHaveBeenCalledWith("user123", {
      password: "new_hashed_pw",
    });
    expect(result!.password).toBe("new_hashed_pw");
  });

  // SEND RESET EMAIL
  it("should throw 404 if email not provided", async () => {
    await expect(userService.sendResetPasswordEmail(undefined)).rejects.toThrow(
      new HttpError(404, "Email is required"),
    );
  });

  it("should send reset password OTP email", async () => {
    repo.getUserByEmail.mockResolvedValue(fakeUser as any);
    (sendOTPEmail as jest.Mock).mockResolvedValue("123456");

    const otp = await userService.sendResetPasswordOTPEmail("john@example.com");
    expect(otp).toBe("123456");
    expect(sendOTPEmail).toHaveBeenCalledWith("john@example.com");
  });

  // GET MYSELF
  it("should throw 404 if user not found in getMyself", async () => {
    repo.getUserCart.mockResolvedValue(null);

    await expect(userService.getMyself("user123")).rejects.toThrow(
      new HttpError(404, "User not found"),
    );
  });

  it("should get user myself successfully", async () => {
    repo.getUserCart.mockResolvedValue(fakeUser as any);

    const user = await userService.getMyself("user123");
    expect(user).toEqual(fakeUser);
  });

  // ADD TO CART
  it("should throw 404 if user not found in addToCart", async () => {
    repo.addToCart.mockResolvedValue(null);

    await expect(
      userService.addToCart("user123", { product: "p1", quantity: 1 }),
    ).rejects.toThrow(new HttpError(404, "User not found user123"));
  });

  it("should add item to cart successfully", async () => {
    repo.addToCart.mockResolvedValue({
      ...fakeUser,
      cart: [{ product: "p1", quantity: 1 }],
    } as any);

    const updatedUser = await userService.addToCart("user123", {
      product: "p1",
      quantity: 1,
    });
    expect(updatedUser.cart).toHaveLength(1);
    expect(repo.addToCart).toHaveBeenCalledWith("user123", {
      product: "p1",
      quantity: 1,
    });
  });
});
