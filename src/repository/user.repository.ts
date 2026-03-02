import { ClientSession, QueryFilter, Types } from "mongoose";
import { IUser, UserModel } from "../models/user.model";
import { AddToCartDTO } from "../dtos/user.dto";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(userName: string): Promise<IUser | null>;
  getAllUsers(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ users: IUser[]; total: number }>;
  getUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, updatedData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }
  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email: email });
    return user;
  }
  async getUserByUsername(userName: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ username: userName });
    return user;
  }
  async getUserById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id).populate({
      path: "cart.bookId",
      select: "title author price publishedYear",
    });
    return user;
  }
  async getUserCart(id: string) {
    return await UserModel.findById(id).populate({
      path: "cart.bookId",
      select: "title author price publishedYear coverImg",
    });
  }
  async getAllUsers(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ users: IUser[]; total: number }> {
    const filter: QueryFilter<IUser> = {};

    if (search?.trim()) {
      const cleanSearch = search.trim();

      const orConditions: any[] = [
        { username: { $regex: cleanSearch, $options: "i" } },
        { email: { $regex: cleanSearch, $options: "i" } },
        { firstName: { $regex: cleanSearch, $options: "i" } },
        { lastName: { $regex: cleanSearch, $options: "i" } },
      ];
      if (Types.ObjectId.isValid(cleanSearch)) {
        orConditions.push({ _id: new Types.ObjectId(cleanSearch) });
      }

      filter.$or = orConditions;
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .skip((page - 1) * size)
        .limit(size),
      UserModel.countDocuments(filter),
    ]);

    return { users, total };
  }

  async updateUser(
    id: string,
    updatedData: Partial<IUser>,
  ): Promise<IUser | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    return updatedUser;
  }
  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
  }

  async uploadProfilePicture(file: Express.Multer.File) {
    return file.filename;
  }

  async addToCart(userId: string, data: AddToCartDTO): Promise<IUser | null> {
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        "cart.bookId": data.product,
      },
      {
        $inc: { "cart.$.quantity": data.quantity },
      },
      { new: true },
    );

    if (updatedUser) return updatedUser;

    // If product not in cart → push new one
    return await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          cart: {
            bookId: data.product,
            quantity: data.quantity,
          },
        },
      },
      { new: true },
    );
  }

  async clearCart(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
  }
}
