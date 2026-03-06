import { CreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { HttpError } from "../../error/http-error";
import { BookModel } from "../../models/book.model";
import { OrderModel } from "../../models/order.model";
import { ReviewModel } from "../../models/review.model";
import { UserModel } from "../../models/user.model";
import { UserRepository } from "../../repository/user.repository";
import bcryptjs from "bcryptjs";

const userRepository = new UserRepository();

export class AdminUserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    // hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async getAllUsers(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { users, total } = await userRepository.getAllUsers(
      pageNumber,
      pageSize,
      search,
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { users, pagination };
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const deleted = await userRepository.deleteUser(id);
    return deleted;
  }

  async updateUser(id: string, updateData: UpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const updatedUser = await userRepository.updateUser(id, updateData);
    return updatedUser;
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  // info: this is for the dashboard page of admin
  async getDashboardSummary() {
    const [
      totalUsers,
      totalBooks,
      lowStockBooks,
      totalOrders,
      pendingOrders,
      totalReviews,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      UserModel.countDocuments(),
      BookModel.countDocuments(),
      BookModel.countDocuments({ stockAmount: { $lte: 5 } }),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: "pending" }),
      ReviewModel.countDocuments(),
      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id userId totalPrice status createdAt"),
      UserModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id name email createdAt"),
    ]);

    return {
      totalUsers,
      totalBooks,
      totalOrders,
      totalReviews,
      pendingOrders,
      lowStockBooks,
      recentOrders,
      recentUsers,
    };
  }
}
