import { CreateOrderDTO, UpdateOrderDTO } from "../dtos/order.dto";
import { HttpError } from "../error/http-error";
import { IOrder } from "../models/order.model";
import { BookRepository } from "../repository/book.repository";
import { OrderRepository } from "../repository/order.repository";

const orderRepository = new OrderRepository();
const bookRepository = new BookRepository();
export class OrderService {
  //info: create
  async createOrder(dto: CreateOrderDTO) {
    const bookIds = dto.books.map((b) => b.bookId);
    const booksFromDb = await bookRepository.getBookByIds(bookIds);

    let totalPrice = 0;

    for (const item of booksFromDb) {
      const quantity =
        dto.books.find((b) => b.bookId === item._id.toString())?.quantity || 1;

      totalPrice += item.price * quantity;
    }

    const orderData = {
      userId: dto.userId,
      books: dto.books,
      totalPrice: totalPrice,
      status: "pending",
    };

    const order = await orderRepository.create(orderData);

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
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }
    const updatedOrder = await orderRepository.updateOrder(id, updateData);
    return updatedOrder;
  }
}
