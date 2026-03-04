import { BookModel } from "../../../models/book.model";
import { BookRepository } from "../../../repository/book.repository";
import mongoose, { Schema } from "mongoose";

const GenreSchema = new Schema({
  name: { type: String, required: true },
});

export const GenreModel = mongoose.model("Genre", GenreSchema);

describe("Book Repository Unit Tests", () => {
  let bookRepo: BookRepository;
  let testBookId: string;
  let testGenreId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    bookRepo = new BookRepository();
    BookModel.deleteMany({});
    await GenreModel.deleteMany({});
    const genre = await GenreModel.create({ name: "Test Genre" });
    testGenreId = genre._id;
  });

  afterEach(async () => {
    await BookModel.deleteMany({});
    await GenreModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const getBookData = (overrides = {}) => ({
    title: "Test Book",
    author: "Test Author",
    description: "A book for testing",
    genre: [testGenreId],
    price: 50,
    stockAmount: 10,
    publishedYear: "2025",
    coverImg: "test.jpg",
    ...overrides,
  });

  // Create Book
  test("should create a new book", async () => {
    const newBook = await bookRepo.createBook(getBookData());
    expect(newBook).toBeDefined();
    expect(newBook.title).toBe("Test Book");
    expect(newBook.stockAmount).toBe(10);

    testBookId = newBook._id.toString();
  });

  // Get Book By ID
  test("should get a book by ID", async () => {
    const created = await bookRepo.createBook(getBookData());
    const found = await bookRepo.getBookById(created._id.toString());
    expect(found).toBeDefined();
    expect(found?._id.toString()).toBe(created._id.toString());
  });

  // Get Book By ID - Not Found
  test("should return null when book ID does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await bookRepo.getBookById(fakeId);
    expect(found).toBeNull();
  });

  // Get All Books
  test("should get all books", async () => {
    await bookRepo.createBook(getBookData());
    const books = await bookRepo.getAllBooks();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);
  });

  // Update Book
  test("should update a book", async () => {
    const created = await bookRepo.createBook(getBookData());
    const updated = await bookRepo.updateBook(created._id.toString(), {
      stockAmount: 5,
    });
    expect(updated).toBeDefined();
    expect(updated?.stockAmount).toBe(5);
  });

  // Delete Book
  test("should delete a book by ID", async () => {
    const created = await bookRepo.createBook(getBookData());
    const deleted = await bookRepo.deleteBook(created._id.toString());
    expect(deleted).toBe(true);

    const check = await bookRepo.getBookById(created._id.toString());
    expect(check).toBeNull();
  });

  // Decrease Stock - Not Enough
  test("should not decrease stock if not enough quantity", async () => {
    const created = await bookRepo.createBook(getBookData({ stockAmount: 2 }));
    const updated = await bookRepo.decreaseStock(created._id.toString(), 5);
    expect(updated).toBeNull();
  });

  // Get Book By Title
  test("should get book by title", async () => {
    const created = await bookRepo.createBook(
      getBookData({ title: "Unique Title" }),
    );
    const found = await bookRepo.getBookByTitle("Unique Title");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Unique Title");
  });

  // Get Book By Multiple IDs
  test("should get books by multiple IDs", async () => {
    const b1 = await bookRepo.createBook(getBookData({ title: "Book 1" }));
    const b2 = await bookRepo.createBook(getBookData({ title: "Book 2" }));
    const books = await bookRepo.getBookByIds([
      b1._id.toString(),
      b2._id.toString(),
    ]);
    expect(books.length).toBe(2);
    expect(books.map((b) => b.title)).toContain("Book 1");
    expect(books.map((b) => b.title)).toContain("Book 2");
  });
});
