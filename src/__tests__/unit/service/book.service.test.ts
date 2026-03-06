import mongoose from "mongoose";
import { BookService } from "../../../service/book.service";
import { BookRepository } from "../../../repository/book.repository";
import { BookModel, IBook } from "../../../models/book.model";
import { GenreModel } from "../../../models/genre.model";
import { HttpError } from "../../../error/http-error";

// Mocks
jest.mock("../../../repository/book.repository");
jest.mock("../../../models/book.model");
jest.mock("../../../models/genre.model");

describe("BookService Unit Tests", () => {
  let bookService: BookService;

  const fakeBook: Partial<IBook> = {
    _id: new mongoose.Types.ObjectId(),
    title: "Test Book",
    author: "John Doe",
    description: "A test book",
    genre: [new mongoose.Types.ObjectId()],
    price: 20,
    stockAmount: 10,
    publishedYear: "2023",
    coverImg: "cover.jpg",
  };

  const repo = {
    getAllBooks: jest.spyOn(BookRepository.prototype, "getAllBooks"),
    getBookById: jest.spyOn(BookRepository.prototype, "getBookById"),
    getBooksByGenre: jest.spyOn(BookRepository.prototype, "getBooksByGenre"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    bookService = new BookService();
  });

  // CREATE BOOK
  it("should create a new book with valid genres", async () => {
    const genreIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
    ];
    const bookData = {
      title: "New Book",
      author: "Author",
      description: "Description",
      genre: ["Fiction", "Adventure"],
      price: 25,
      stockAmount: 5,
      publishedYear: "2023",
      coverImg: "img.jpg",
    };

    // Mock GenreModel.find
    (GenreModel.find as jest.Mock).mockResolvedValue([
      { _id: genreIds[0], name: "Fiction" },
      { _id: genreIds[1], name: "Adventure" },
    ]);

    // Mock BookModel.create
    (BookModel.create as jest.Mock).mockImplementation((data) => ({
      ...data,
      _id: new mongoose.Types.ObjectId(),
    }));

    const book = await bookService.createBook(bookData as any);

    expect(GenreModel.find).toHaveBeenCalledWith({
      name: { $in: bookData.genre },
    });
    expect(BookModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...bookData,
        genre: genreIds,
      }),
    );
    expect(book.title).toBe(bookData.title);
  });

  it("should throw error if a genre is missing", async () => {
    const bookData = {
      title: "New Book",
      author: "Author",
      description: "Desc",
      genre: ["Fiction", "Adventure"],
      price: 25,
      stockAmount: 5,
      publishedYear: "2023",
      coverImg: "img.jpg",
    };

    (GenreModel.find as jest.Mock).mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(), name: "Fiction" },
    ]);

    await expect(bookService.createBook(bookData as any)).rejects.toThrow(
      new HttpError(400, "Genre(s) not found: Adventure"),
    );
  });

  it("should create a book if genre array is empty", async () => {
    const bookData = {
      title: "No Genre Book",
      author: "Author",
      description: "Desc",
      genre: [],
      price: 15,
      stockAmount: 3,
      publishedYear: "2023",
      coverImg: "img.jpg",
    };

    (BookModel.create as jest.Mock).mockImplementation((data) => ({
      ...data,
      _id: new mongoose.Types.ObjectId(),
    }));

    const book = await bookService.createBook(bookData as any);
    expect(BookModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ ...bookData, genre: [] }),
    );
    expect(book.title).toBe("No Genre Book");
  });

  // GET ALL BOOKS
  it("should get all books", async () => {
    repo.getAllBooks.mockResolvedValue([fakeBook as any]);

    const books = await bookService.getAllBooks();
    expect(repo.getAllBooks).toHaveBeenCalled();
    expect(books).toHaveLength(1);
    expect(books[0].title).toBe(fakeBook.title);
  });

  // GET BOOK BY ID
  it("should get a book by ID", async () => {
    repo.getBookById.mockResolvedValue(fakeBook as any);

    const book = await bookService.getBookById("book123");
    expect(repo.getBookById).toHaveBeenCalledWith("book123");
    expect(book.title).toBe(fakeBook.title);
  });

  it("should throw 404 if book not found", async () => {
    repo.getBookById.mockResolvedValue(null);

    await expect(bookService.getBookById("nonexistent")).rejects.toThrow(
      new HttpError(404, "No book of such Id"),
    );
  });

  // GET BOOKS BY GENRE
  it("should get books by genre", async () => {
    repo.getBooksByGenre.mockResolvedValue([fakeBook as any]);

    const books = await bookService.getBooksByGenre("genre123");
    expect(repo.getBooksByGenre).toHaveBeenCalledWith("genre123");
    expect(books[0].title).toBe(fakeBook.title);
  });
});
