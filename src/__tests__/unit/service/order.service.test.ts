import mongoose from "mongoose";
import { OrderService } from "../../../service/order.service";
import { OrderRepository } from "../../../repository/order.repository";
import { BookRepository } from "../../../repository/book.repository";
import { UserRepository } from "../../../repository/user.repository";
import { IOrder } from "../../../models/order.model";
import { HttpError } from "../../../error/http-error";

// --- Mocks ---
jest.mock("../../../repository/order.repository");
jest.mock("../../../repository/book.repository");
jest.mock("../../../repository/user.repository");

describe("OrderService Unit Tests", () => {
  let orderService: OrderService;

  const repo = {
    create: jest.spyOn(OrderRepository.prototype, "create"),
    deleteOrder: jest.spyOn(OrderRepository.prototype, "deleteOrder"),
    getAllOrdersPaginated: jest.spyOn(
      OrderRepository.prototype,
      "getAllOrdersPaginated",
    ),
    getOrderById: jest.spyOn(OrderRepository.prototype, "getOrderById"),
    updateOrder: jest.spyOn(OrderRepository.prototype, "updateOrder"),
    getOrdersByUserId: jest.spyOn(
      OrderRepository.prototype,
      "getOrdersByUserId",
    ),
  };

  const bookRepo = {
    getBookByIds: jest.spyOn(BookRepository.prototype, "getBookByIds"),
    decreaseStock: jest.spyOn(BookRepository.prototype, "decreaseStock"),
  };

  const userRepo = {
    getUserById: jest.spyOn(UserRepository.prototype, "getUserById"),
    clearCart: jest.spyOn(UserRepository.prototype, "clearCart"),
  };

  const fakeBook = {
    _id: new mongoose.Types.ObjectId(),
    title: "Book 1",
    price: 20,
  };

  const fakeUser = {
    _id: new mongoose.Types.ObjectId(),
    cart: [{ bookId: fakeBook._id, quantity: 2 }],
  };

  const fakeOrder = {
    _id: new mongoose.Types.ObjectId(),
    userId: fakeUser._id,
    books: [{ bookId: fakeBook._id, quantity: 2 }],
    totalPrice: 40,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService();
  });

  // -------------------- CREATE ORDER --------------------
  it("should create an order for a user with items in cart", async () => {
    userRepo.getUserById.mockResolvedValue(fakeUser as any);
    bookRepo.getBookByIds.mockResolvedValue([fakeBook] as any);
    repo.create.mockResolvedValue(fakeOrder as any);
    userRepo.clearCart.mockResolvedValue(undefined);

    const order = await orderService.createOrder(fakeUser._id.toString());
    expect(userRepo.getUserById).toHaveBeenCalledWith(fakeUser._id.toString());
    expect(bookRepo.getBookByIds).toHaveBeenCalledWith([fakeBook._id]);
    expect(repo.create).toHaveBeenCalled();
    expect(userRepo.clearCart).toHaveBeenCalledWith(fakeUser._id.toString());
    expect(order.totalPrice).toBe(40);
  });

  it("should throw 404 if user not found", async () => {
    userRepo.getUserById.mockResolvedValue(null);
    await expect(orderService.createOrder("missingUser")).rejects.toThrow(
      new HttpError(404, "User not found"),
    );
  });

  it("should throw 400 if cart is empty", async () => {
    userRepo.getUserById.mockResolvedValue({ ...fakeUser, cart: [] } as any);
    await expect(
      orderService.createOrder(fakeUser._id.toString()),
    ).rejects.toThrow(new HttpError(400, "Cart is empty"));
  });

  // -------------------- DELETE ORDER --------------------
  it("should delete an order", async () => {
    repo.deleteOrder.mockResolvedValue(true);
    const deleted = await orderService.deleteOrder("order123");
    expect(repo.deleteOrder).toHaveBeenCalledWith("order123");
    expect(deleted).toBe(true);
  });

  // -------------------- GET ALL ORDERS PAGINATED --------------------
  it("should get all orders paginated with default page/size", async () => {
    repo.getAllOrdersPaginated.mockResolvedValue({
      orders: [fakeOrder as any],
      total: 1,
    });
    const result = await orderService.getAllOrdersPaginated();
    expect(repo.getAllOrdersPaginated).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.orders).toHaveLength(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  // -------------------- UPDATE ORDER --------------------
  it("should update order status to paid and reduce stock", async () => {
    const updateData = { status: "paid" as const };
    repo.getOrderById.mockResolvedValue(fakeOrder as any);
    bookRepo.decreaseStock.mockResolvedValue({} as any);
    repo.updateOrder.mockResolvedValue({ ...fakeOrder, ...updateData } as any);

    const updated = await orderService.updateOrder("order123", updateData);
    expect(repo.getOrderById).toHaveBeenCalledWith("order123");
    expect(bookRepo.decreaseStock).toHaveBeenCalledWith(
      fakeBook._id.toString(),
      2,
    );
    expect(repo.updateOrder).toHaveBeenCalledWith("order123", updateData);
    expect(updated!.status).toBe("paid");
  });

  it("should throw 404 if order not found on update", async () => {
    repo.getOrderById.mockResolvedValue(null);
    await expect(
      orderService.updateOrder("missingOrder", { status: "paid" }),
    ).rejects.toThrow(new HttpError(404, "Order not found"));
  });

  it("should throw 400 if stock is insufficient", async () => {
    const updateData = { status: "paid" as const };
    repo.getOrderById.mockResolvedValue(fakeOrder as any);
    bookRepo.decreaseStock.mockResolvedValue(null);

    await expect(
      orderService.updateOrder("order123", updateData),
    ).rejects.toThrow(
      new HttpError(400, `Not enough stock for book ID: ${fakeBook._id}`),
    );
  });

  // -------------------- GET ORDERS BY USER ID --------------------
  it("should get orders by user ID", async () => {
    repo.getOrdersByUserId.mockResolvedValue([fakeOrder as any]);
    const orders = await orderService.getOrdersByUserId(
      fakeUser._id.toString(),
    );
    expect(repo.getOrdersByUserId).toHaveBeenCalledWith(
      fakeUser._id.toString(),
    );
    expect(orders).toHaveLength(1);
  });

  it("should throw error if userId is not provided", async () => {
    await expect(orderService.getOrdersByUserId("")).rejects.toThrow(
      new Error("User ID is required"),
    );
  });
});
