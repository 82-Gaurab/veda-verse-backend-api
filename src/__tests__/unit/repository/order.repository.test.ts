import mongoose from "mongoose";
import { OrderModel } from "../../../models/order.model";
import { UserModel, IUser } from "../../../models/user.model";
import { BookModel, IBook } from "../../../models/book.model";
import { OrderRepository } from "../../../repository/order.repository";

describe("Order Repository Unit Tests", () => {
  let orderRepo: OrderRepository;
  let testUser: IUser;
  let testBook: IBook;
  let testOrderId: string;

  beforeAll(async () => {
    // Connect once
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
    }
    orderRepo = new OrderRepository();

    // Create a test user
    testUser = await UserModel.create({
      username: "orderuser",
      email: "orderuser@test.com",
      password: "password123",
    });

    // Create a test book
    testBook = await BookModel.create({
      title: "Order Test Book",
      author: "Author",
      description: "Test book for orders",
      genre: [],
      price: 10,
      stockAmount: 100,
      coverImg: "",
      publishedYear: "2026",
    });
  });

  afterEach(async () => {
    await OrderModel.deleteMany({});
  });

  afterAll(async () => {
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await BookModel.deleteMany({});
    await mongoose.connection.close();
  });

  const getOrderData = (overrides = {}) => ({
    userId: testUser._id,
    books: [{ bookId: testBook._id, quantity: 2 }],
    totalPrice: 20,
    status: "pending" as const,
    ...overrides,
  });

  // 1. Create Order
  test("should create a new order", async () => {
    const order = await orderRepo.create(getOrderData());
    expect(order).toBeDefined();
    expect(order.userId.toString()).toBe(testUser._id.toString());
    expect(order.books.length).toBe(1);
    testOrderId = order._id.toString();
  });

  // 2. Get Order By ID
  test("should get an order by ID", async () => {
    const created = await orderRepo.create(getOrderData());
    const found = await orderRepo.getOrderById(created._id.toString());
    expect(found).toBeDefined();
    expect(found?.userId._id.toString()).toBe(testUser._id.toString());
    expect(found?.books[0].bookId._id.toString()).toBe(testBook._id.toString());
  });

  // 3. Update Order
  test("should update an order status", async () => {
    const created = await orderRepo.create(getOrderData());
    const updated = await orderRepo.updateOrder(created._id.toString(), {
      status: "paid",
    });
    expect(updated).toBeDefined();
    expect(updated?.status).toBe("paid");
  });

  // 4. Delete Order
  test("should delete an order by ID", async () => {
    const created = await orderRepo.create(getOrderData());
    const result = await orderRepo.deleteOrder(created._id.toString());
    expect(result).toBe(true);
    const deleted = await orderRepo.getOrderById(created._id.toString());
    expect(deleted).toBeNull();
  });

  // 5. Get All Orders Paginated
  test("should get all orders paginated", async () => {
    await orderRepo.create(getOrderData());
    await orderRepo.create(getOrderData({ totalPrice: 50 }));

    const { orders, total } = await orderRepo.getAllOrdersPaginated(1, 10);
    expect(total).toBe(2);
    expect(orders.length).toBe(2);
  });

  // 6. Get Orders By User ID
  test("should get orders by user ID", async () => {
    const order1 = await orderRepo.create(getOrderData());
    const order2 = await orderRepo.create(getOrderData({ totalPrice: 50 }));

    const userOrders = await orderRepo.getOrdersByUserId(
      testUser._id.toString(),
    );
    expect(userOrders.length).toBe(2);
    expect(userOrders.map((o) => o._id.toString())).toEqual(
      expect.arrayContaining([order1._id.toString(), order2._id.toString()]),
    );
  });
});
