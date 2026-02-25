import { QueryFilter } from "mongoose";
import { CreateOrderDTO } from "../dtos/order.dto";
import { IOrder, OrderModel } from "../models/order.model";

export class OrderRepository {
  //info: create
  async create(data: CreateOrderDTO): Promise<IOrder> {
    const order = new OrderModel(data);
    return await order.save();
  }
  //info: delete
  async deleteOrder(id: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(id);
    return result ? true : false;
  }
  //info: get by id
  async getOrderById(id: string): Promise<IOrder | null> {
    return await OrderModel.findById(id)
      .populate("userId", "name email")
      .populate("books.bookId", "name price");
  }
  //info: update
  async updateOrder(
    id: string,
    updatedData: Partial<IOrder>,
  ): Promise<IOrder | null> {
    return await OrderModel.findByIdAndUpdate(id, updatedData, { new: true });
  }
  // info: get all for admin
  async getAllOrdersPaginated(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ orders: IOrder[]; total: number }> {
    const filter: QueryFilter<IOrder> = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("books.bookId", "title price")
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size),
      OrderModel.countDocuments(filter),
    ]);

    return { orders, total };
  }
  //info: get by user id
  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    return await OrderModel.find({ userId }).sort({ createdAt: -1 });
  }
}
