import mongoose from "mongoose";
import { UpdateOrderDTO } from "../dtos/order.dto";
import { HttpError } from "../error/http-error";
import { IOrder } from "../models/order.model";
import { BookRepository } from "../repository/book.repository";
import { OrderRepository } from "../repository/order.repository";
import { UserRepository } from "../repository/user.repository";

const orderRepository = new OrderRepository();
const bookRepository = new BookRepository();
const userRepository = new UserRepository();
export class OrderService {
  //info: create
  async createOrder(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    if (user.cart == undefined || user.cart.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    const bookIds = user.cart.map((item) => item.bookId);
    const books = await bookRepository.getBookByIds(bookIds);

    let totalPrice = 0;

    const orderBooks = books.map((book) => {
      const cartItem = user.cart!.find(
        (item) => item.bookId.toString() === book._id.toString(),
      );

      const quantity = cartItem?.quantity || 1;

      totalPrice += book.price * quantity;

      return {
        bookId: book._id,
        quantity,
      };
    });

    const order = await orderRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      books: orderBooks,
      totalPrice,
      status: "pending",
    });

    await userRepository.clearCart(userId);

    return order;
  }
  //info: delete
  async deleteOrder(id: string) {
    const deleted = await orderRepository.deleteOrder(id);
    return deleted;
  }
  // info: get all
  async getAllOrdersPaginated(
    page?: string,
    size?: string,
    search?: string,
  ): Promise<{
    orders: IOrder[];
    pagination: {
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { orders, total } = await orderRepository.getAllOrdersPaginated(
      pageNumber,
      pageSize,
      search,
    );

    const formattedOrders = orders.map((order) => ({
      ...order.toObject(),
      books: order.books.map((book) => ({
        bookId: book.bookId._id,
        bookName: (book.bookId as any).title,
        quantity: book.quantity,
      })),
    }));

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { orders: formattedOrders, pagination };
  }
  // info: update
  async updateOrder(id: string, updateData: UpdateOrderDTO) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepository.getOrderById(id);
      if (!order) throw new HttpError(404, "Order not found");

      // Only trigger stock reduction when status changes to paid
      if (updateData.status === "paid" && order.status !== "paid") {
        for (const item of order.books) {
          const updatedBook = await bookRepository.decreaseStock(
            item.bookId.toString(),
            item.quantity,
            session,
          );

          if (!updatedBook) {
            throw new HttpError(
              400,
              `Not enough stock for book ID: ${item.bookId}`,
            );
          }
        }
      }

      const updatedOrder = await orderRepository.updateOrder(id, updateData);

      await session.commitTransaction();
      session.endSession();

      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  //info: order by user id
  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return await orderRepository.getOrdersByUserId(userId);
  }
}
